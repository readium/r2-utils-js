// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import * as debug_ from "debug";
import * as fs from "fs";
import * as path from "path";

import { IStreamAndLength, IZip, Zip } from "./zip";

// import * as filehound from "filehound";
// import { bufferToStream } from "../stream/BufferUtils";

const debug = debug_("r2:utils#zip/zip-ex");

export class ZipExploded extends Zip {

    public static async loadPromise(dirPath: string): Promise<IZip> {
        return Promise.resolve(new ZipExploded(dirPath));
    }

    private constructor(readonly dirPath: string) {
        super();
    }

    public freeDestroy(): void {
        debug("freeDestroy: ZipExploded -- " + this.dirPath);
    }

    public entriesCount(): number {
        return 0; // TODO: hacky! (not really needed ... but still)
    }

    public hasEntries(): boolean {
        return true; // TODO: hacky
    }

    public hasEntry(entryPath: string): boolean {
        return this.hasEntries()
            && fs.existsSync(path.join(this.dirPath, entryPath));
    }

    public async getEntries(): Promise<string[]> {

        return new Promise<string[]>(async (resolve, _reject) => {

            const dirPathNormalized = fs.realpathSync(this.dirPath);

            // const files: string[] = await filehound.create()
            //     // .discard("node_modules")
            //     // .depth(5)
            //     .paths(this.dirPath)
            //     // .ext([".epub", ".epub3", ".cbz"])
            //     .find();
            const files = fs.readdirSync(this.dirPath, { withFileTypes: true }).
                filter((f) => f.isFile()).map((f) => path.join(this.dirPath, f.name));

            const adjustedFiles = files.map((file) => {
                const filePathNormalized = fs.realpathSync(file);

                let relativeFilePath = filePathNormalized.replace(dirPathNormalized, "");
                // debug(relativeFilePath);

                if (relativeFilePath.indexOf("/") === 0 || relativeFilePath.indexOf("\\") === 0) {
                    relativeFilePath = relativeFilePath.substr(1);
                }

                return relativeFilePath;
            });

            resolve(adjustedFiles);
        });
    }

    public async entryStreamPromise(entryPath: string): Promise<IStreamAndLength> {

        // debug(`entryStreamPromise: ${entryPath}`);

        if (!this.hasEntries() || !this.hasEntry(entryPath)) {
            return Promise.reject("no such path in zip exploded: " + entryPath);
        }

        const fullPath = path.join(this.dirPath, entryPath);
        const stats = fs.lstatSync(fullPath);

        const streamAndLength: IStreamAndLength = {
            length: stats.size,
            reset: async () => {
                return this.entryStreamPromise(entryPath);
            },
            stream: fs.createReadStream(fullPath, { autoClose: false }),
        };

        return Promise.resolve(streamAndLength);
    }
}
