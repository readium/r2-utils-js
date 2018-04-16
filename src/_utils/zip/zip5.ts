import * as debug_ from "debug";
import { URL } from "isomorphic-url-shim";
import { IStreamAndLength, IZip, Zip } from "./zip";
import { Zip5Entry } from "./zip5Entry";

const debug = debug_("r2:utils#zip/zip5");

export class Zip5 extends Zip {

    public static async loadPromise(url: string): Promise<IZip> {
        return new Promise<IZip>(async (resolve, _reject) => {
            const zip5 = new Zip5(url);
            const testFile = "META-INF/container.xml";
            const urlString = new URL(testFile, url);
            const entry = new Zip5Entry(urlString.toString());
            zip5.entries.set(testFile, entry);
            resolve(zip5);
        });
    }

    private baseURL: string;
    private entries: Map<string, Zip5Entry>;

    private constructor(readonly filePath: string) {
        super();
        this.baseURL = filePath;
        this.entries = new Map();
    }

    public freeDestroy(): void {
        debug("freeDestroy: Zip5 -- " + this.filePath);
    }

    public entriesCount(): number {
        return this.entries.size;
    }

    public hasEntries(): boolean {
        return this.entriesCount() > 0;
    }

    public async hasEntry(entryPath: string): Promise<boolean> {
        return this.getEntry(entryPath).exists();
    }

    public forEachEntry(callback: (entryName: string) => void) {

        if (!this.hasEntries()) {
            return;
        }

        Object.keys(this.entries).forEach((entryName) => {
            callback(entryName);
        });
    }

    public async entryStreamPromise(entryPath: string): Promise<IStreamAndLength> {
        const entry = this.getEntry(entryPath);

        if (!entry.exists()) {
            return Promise.reject("no such path in zip: " + entryPath);
        }

        return new Promise<IStreamAndLength>(async (resolve, _reject) => {
            debug(entry);

            const streamAndLength: IStreamAndLength = {
                length: await entry.size(),
                reset: async () => {
                    return this.entryStreamPromise(entryPath);
                },
                stream: await entry.stream(),
            };
            resolve(streamAndLength);
        });
    }

    private getEntry(entryPath: string) {
        const entry = this.entries.get(entryPath);
        if (!entry) {
            const newEntry = new Zip5Entry(new URL(entryPath, this.baseURL).toString());
            this.entries.set(entryPath, newEntry);
            return newEntry;
        }
        return entry;
    }
}
