// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as fs from "fs";
import * as path from "path";

import * as filehound from "filehound";

// ZIP 1
import * as StreamZip from "node-stream-zip";

// ZIP 2
import * as yauzl from "yauzl";

// ZIP 3
import * as unzipper from "unzipper";

const N_ITERATIONS = 40;
const VERBOSE = false;

console.log("process.cwd():");
console.log(process.cwd());

console.log("__dirname:");
console.log(__dirname);

const args = process.argv.slice(2);
console.log("args:");
console.log(args);

if (!args[0]) {
    console.log("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}
const argPath = args[0].trim();
let filePath = argPath;
console.log(filePath);
if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, argPath);
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), argPath);
        console.log(filePath);
        if (!fs.existsSync(filePath)) {
            console.log("FILEPATH DOES NOT EXIST.");
            process.exit(1);
        }
    }
}

const stats = fs.lstatSync(filePath);
if (!stats.isFile() && !stats.isDirectory()) {
    console.log("FILEPATH MUST BE FILE OR DIRECTORY.");
    process.exit(1);
}

const fileName = path.basename(filePath);
const ext = path.extname(fileName).toLowerCase();

const argExtra = args[1] ? args[1].trim() : undefined;
const READ_ZIP_STREAMS = argExtra === "1";

async function streamReadAll(readStream: NodeJS.ReadableStream): Promise<number> {

    return new Promise<number>((resolve, reject) => {

        let totalBytes = 0;

        const cleanup = () => {
            readStream.removeListener("data", handleData);
            readStream.removeListener("error", handleError);
            readStream.removeListener("end", handleEnd);
        };

        const handleError = () => {
            cleanup();
            reject();
        };
        readStream.on("error", handleError);

        const handleData = (data: Buffer) => {
            totalBytes += data.length;
        };
        readStream.on("data", handleData);

        const handleEnd = () => {
            cleanup();
            resolve(totalBytes);
        };
        readStream.on("end", handleEnd);
    });
}

const zip1 = async (file: string): Promise<number[]> => {
    return new Promise<number[]>((resolve, reject) => {

        const zip = new StreamZip({
            file,
            storeEntries: true,
        });

        zip.on("error", (err: any) => {
            console.log("--ZIP error: " + filePath);
            console.log(err);

            reject(err);
        });

        zip.on("entry", (_entry: any) => {
            // console.log("--ZIP: entry");
            // console.log(entry.name);
        });

        zip.on("extract", (entry: any, f: any) => {
            console.log("--ZIP extract:");
            console.log(entry.name);
            console.log(f);
        });

        zip.on("ready", async () => {
            // console.log("--ZIP: ready");
            // console.log(zip.entriesCount);

            const crcs = Object.values(zip.entries()).map((zipEntry: any) => {
                // if (/\/$/.test(zipEntry.name)) {
                if (zipEntry.isDirectory) { // zipEntry.name[zipEntry.name.length - 1] === "/"
                    // skip directories / folders
                    return 0;
                } else {
                    if (!zipEntry.crc && zipEntry.size) {
                        console.log(`1 CRC zero? ${zipEntry.name} (${zipEntry.size} bytes) => ${zipEntry.crc}`);
                    }
                    return zipEntry.crc as number;
                }
            }).filter((val: number) => {
                return val; // falsy includes zero, null, undefined
            });

            if (READ_ZIP_STREAMS) {
                const zipEntries = Object.values(zip.entries()) as any[];
                for (const zipEntry of zipEntries) {
                    const size = await new Promise((res, rej) => {
                        zip.stream(zipEntry.name, async (err: any, stream: any) => {
                            if (err) {
                                console.log(err);
                                rej(err);
                            }
                            // stream.pipe(process.stdout);
                            const totalBytes = streamReadAll(stream);
                            res(totalBytes);
                        });
                    });
                    if (zipEntry.size !== size) {
                        console.log(`1 SIZE MISMATCH? ${zipEntry.name} ${zipEntry.size} != ${size}`);
                    }
                }
            }

            process.nextTick(() => {
                zip.close();
                process.nextTick(() => {
                    resolve(crcs);
                });
            });
        });
    });
};
(zip1 as any).zipName = "node-stream-zip";

const zip2 = async (file: string): Promise<number[]> => {
    return new Promise<number[]>((resolve, reject) => {
        let crcs: number[] | undefined;
        yauzl.open(file, { lazyEntries: true, autoClose: false }, (err: any, zip: any) => {
            if (err) {
                console.log("yauzl init ERROR");
                console.log(err);
                reject(err);
                return;
            }

            zip.on("error", (erro: any) => {
                console.log("yauzl ERROR");
                console.log(erro);
                reject(erro);
            });

            zip.readEntry(); // next (lazyEntries)
            zip.on("entry", (entry: any) => {
                // if (/\/$/.test(entry.fileName)) {
                if (entry.fileName[entry.fileName.length - 1] === "/") {
                    // skip directories / folders
                } else {
                    if (!entry.crc32 && entry.uncompressedSize) {
                        // tslint:disable-next-line:max-line-length
                        console.log(`2 CRC zero? ${entry.fileName} (${entry.uncompressedSize} bytes) => ${entry.crc32}`);
                    }
                    if (!crcs) {
                        crcs = [];
                    }
                    crcs.push(entry.crc32 as number);
                }
                zip.readEntry(); // next (lazyEntries)
            });

            zip.on("end", () => {
                // console.log("yauzl END");

                if (READ_ZIP_STREAMS) {
                    // TODO
                }

                process.nextTick(() => {
                    zip.close(); // not autoClose
                    process.nextTick(() => {
                        if (!crcs) {
                            reject(crcs);
                            return;
                        }
                        resolve(crcs.filter((val) => {
                            return val; // falsy includes zero, null, undefined
                        }));
                    });
                });
            });

            zip.on("close", () => {
                // console.log("yauzl CLOSE");
            });
        });
    });
};
(zip2 as any).zipName = "yauzl";

const zip3 = async (file: string): Promise<number[]> => {
    return new Promise<number[]>(async (resolve, reject) => {
        let zip: any;
        try {
            zip = await unzipper.Open.file(file);
        } catch (err) {
            console.log(err);
            reject(err);
            return;
        }
        const crcs = zip.files.map((zipEntry: any) => {
            // if (/\/$/.test(zipEntry.path)) {
            if (zipEntry.type === "Directory") { // zipEntry.path[zipEntry.path.length - 1] === "/")
                // skip directories / folders
                return 0;
            } else {
                if (!zipEntry.crc32 && zipEntry.uncompressedSize) {
                    // tslint:disable-next-line:max-line-length
                    console.log(`3 CRC zero? ${zipEntry.path} (${zipEntry.uncompressedSize} bytes) => ${zipEntry.crc32}`);
                }
                return zipEntry.crc32 as number;
            }
        }).filter((val: number) => {
            return val; // falsy includes zero, null, undefined
        });

        if (READ_ZIP_STREAMS) {
            // TODO
        }

        resolve(crcs);
    });
};
(zip3 as any).zipName = "unzipper";

const zips = [zip1, zip2, zip3];

async function processFile(file: string) {
    console.log(`=====================================`);
    console.log(`PROCESSING: ${file}`);
    console.log(`=====================================`);

    let winner = 0;
    let minNanoOverall = Number.MAX_SAFE_INTEGER;

    let iZip = 0;
    for (const zip of zips) {
        iZip++;

        (zip as any).minNano = Number.MAX_SAFE_INTEGER;

        if (VERBOSE) {
            console.log(`-------------------------------`);
        }

        let crcsPreviousIteration: number[] | undefined;
        for (let i = 0; i < N_ITERATIONS; i++) {
            const time = process.hrtime();
            const crcs = await zip(file);
            const diffTime = process.hrtime(time);
            const nanos = diffTime[0] * 1e9 + diffTime[1];
            if (nanos < (zip as any).minNano) {
                (zip as any).minNano = nanos;
            }
            if (nanos < minNanoOverall) {
                minNanoOverall = nanos;
                winner = iZip;
            }

            if (VERBOSE) {
                // tslint:disable-next-line:max-line-length
                console.log(`Zip ${iZip} (${crcs.length}): ${diffTime[0]} seconds + ${diffTime[1]} nanoseconds`);
            }

            // if (crcs.includes(0)) {
            //     console.log(JSON.stringify(crcs, null, 2));
            // }

            if (crcsPreviousIteration) {
                if (!sameArrays(crcsPreviousIteration, crcs)) {

                    console.log(`++++ Zip ${iZip} (ITERATION ${i}) CRC DIFF!?`);
                    console.log(`-- ${crcsPreviousIteration.length}:`);
                    console.log(JSON.stringify(crcsPreviousIteration, null, 2));
                    console.log(`-- ${crcs.length}:`);
                    console.log(JSON.stringify(crcs, null, 2));
                    process.exit(1);
                }
            }
            crcsPreviousIteration = crcs;
        }
        (zip as any).CRCs = crcsPreviousIteration;
    }

    let crcsPreviousZip: number[] | undefined;
    let isDiff = false;
    for (const zip of zips) {
        if (crcsPreviousZip && (zip as any).CRCs) {
            if (crcsPreviousZip.length !== (zip as any).CRCs.length) {
                isDiff = true;
                break;
            } else {
                for (let j = 0; j < (zip as any).CRCs.length; j++) {
                    if ((zip as any).CRCs[j] !== crcsPreviousZip[j]) {
                        isDiff = true;
                        break;
                    }
                }
            }
            if (isDiff) {
                break;
            }
        }
        crcsPreviousZip = (zip as any).CRCs;
    }
    if (isDiff) {
        console.log(`CRC DIFF! ##############################################`);
        iZip = 0;
        for (const zip of zips) {
            iZip++;
            console.log(`==========================`);
            console.log(`++++ Zip ${iZip} CRC:`);
            console.log(`-- ${(zip as any).CRCs.length}:`);
            console.log(JSON.stringify((zip as any).CRCs));
        }

        for (let j = 0; j < zips.length; j++) {
            const zip = zips[j];
            let nDiffs = 0;
            for (let k = 0; k < zips.length; k++) {
                if (j === k) {
                    continue;
                }
                const zip_ = zips[k];
                if (!sameArrays((zip as any).CRCs, (zip_ as any).CRCs)) {
                    nDiffs++;
                }
            }
            if (nDiffs === (zips.length - 1)) {
                console.log(`####################################`);
                console.log(`####################################`);
                console.log(`SUSPECT ====> Zip ${j + 1} (${(zip as any).zipName})`);
                console.log(`####################################`);
                console.log(`####################################`);
            }
        }

        process.exit(1);
    }

    if (VERBOSE) {
        console.log(`=====================================`);
    }

    iZip = 0;
    for (const zip of zips) {
        iZip++;
        // tslint:disable-next-line:max-line-length
        console.log(`>> Zip ${iZip} (${(zip as any).zipName}) => ${(zip as any).minNano.toLocaleString()} nanoseconds ${iZip === winner ? " [ WINNER ]" : `[ +${((zip as any).minNano - minNanoOverall).toLocaleString()} ]`}`);
    }
}

if (stats.isDirectory()) {

    // tslint:disable-next-line:no-floating-promises
    (async () => {
        const files: string[] = await filehound.create()
            // .discard("node_modules")
            // .depth(5)
            .paths(filePath)
            .ext([".epub", ".epub3", ".cbz", ".zip"])
            // .directory()
            .find();

        for (const file of files) {
            await processFile(file);
        }
    })();

} else if (/\.epub[3]?$/.test(ext) || ext === ".cbz" || ext === ".zip") {
    // tslint:disable-next-line:no-floating-promises
    (async () => {
        await processFile(filePath);
    })();
}

function sameArrays(arr1: number[], arr2: number[]) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    for (let j = 0; j < arr1.length; j++) {
        if (arr1[j] !== arr2[j]) {
            return false;
        }
    }
    return true;
}
