import crossFetch from "cross-fetch";
import fetchStream from "isomorphic-fetch-readablestream";

import { IZipEntry } from "./zip";

const fetch = self.fetch || crossFetch;

export class Zip5Entry implements IZipEntry {
    private fetchHead: Promise<Response>;

    constructor(private path: string) {
        this.fetchHead = fetch(this.path, { method: "HEAD" });
    }

    public async stream(): Promise<ReadableStream> {
        const response = await fetchStream(this.path);
        return response.body;
    }

    public async size(): Promise<number> {
        return parseInt((await this.fetchHead).headers.get("content-length") || "0", 10);
    }

    public async exists(): Promise<boolean> {
        return (await this.fetchHead).ok;
    }
}
