import { createReadStream, stat } from "fs";
import { promisify } from "util";
import { toWebReadableStream } from "web-streams-node";
import { IZipEntry } from "./zip";

const fsStat = promisify(stat);

export class Zip4Entry implements IZipEntry {
    constructor(private path: string) {
    }

    public async stream(): Promise<ReadableStream> {
        return toWebReadableStream(createReadStream(this.path));
    }

    public async size(): Promise<number> {
        return (await fsStat(this.path)).size;
    }
}
