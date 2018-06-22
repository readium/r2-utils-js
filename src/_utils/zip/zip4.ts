// import * as debug_ from "debug";
// import { lstat } from "fs";
// import * as globAsync from "glob";
// import * as path from "path";
// import { promisify } from "util";
//
// const fileStat = promisify(lstat);
// const glob = promisify(globAsync);
//
// import { IStreamAndLength, IZip, IZipEntry, Zip } from "./zip";
// import { Zip4Entry } from "./zip4Entry";
//
// const debug = debug_("r2:utils#zip/zip4");
//
// export class Zip4 extends Zip {
//
//     public static async loadPromise(filePath: string): Promise<IZip> {
//         return new Promise<IZip>(async (resolve, reject) => {
//             if ((await fileStat(filePath)).isFile()) {
//                 return reject("not a directory, expected a path to an exploded (uncompressed) zip");
//             }
//
//             const zip4 = new Zip4(filePath);
//
//             const filesInPath = await glob("**/*", { cwd: filePath, nodir: true });
//             filesInPath.forEach((file: string) => {
//                 zip4.entries.set(file, new Zip4Entry(path.join(filePath, file)));
//             });
//
//             resolve(zip4);
//         });
//     }
//
//     private entries: Map<string, IZipEntry>;
//
//     private constructor(readonly filePath: string) {
//         super();
//
//         this.entries = new Map();
//     }
//
//     public freeDestroy(): void {
//         debug("freeDestroy: Zip4 -- " + this.filePath);
//     }
//
//     public entriesCount(): number {
//         return this.entries.size;
//     }
//
//     public hasEntries(): boolean {
//         return this.entriesCount() > 0;
//     }
//
//     public async hasEntry(entryPath: string): Promise<boolean> {
//         return this.hasEntries() && !!this.entries.get(entryPath);
//     }
//
//     public forEachEntry(callback: (entryName: string) => void) {
//
//         if (!this.hasEntries()) {
//             return;
//         }
//
//         Object.keys(this.entries).forEach((entryName) => {
//             callback(entryName);
//         });
//     }
//
//     public async entryStreamPromise(entryPath: string): Promise<IStreamAndLength> {
//         if (!this.hasEntries()) {
//             return Promise.reject("zip is empty");
//         }
//
//         // debug(`entryStreamPromise: ${entryPath}`);
//         const entry = this.entries.get(entryPath);
//
//         if (!entry) {
//             return Promise.reject("no such path in zip: " + entryPath);
//         }
//
//         return new Promise<IStreamAndLength>(async (resolve, _reject) => {
//             debug(entry);
//
//             const streamAndLength: IStreamAndLength = {
//                 length: await entry.size(),
//                 reset: async () => {
//                     return this.entryStreamPromise(entryPath);
//                 },
//                 stream: await entry.stream(),
//             };
//             resolve(streamAndLength);
//         });
//     }
// }
