// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { BufferReadableStream } from "@utils/stream/BufferReadableStream";
// import { toWebReadableStream } from "web-streams-node";
// import { PassThrough } from "stream";

export function bufferToStream(buffer: Buffer): ReadableStream {

    // return toWebReadableStream(buffer);
    console.log(buffer);
    return new ReadableStream();
}

export function bufferToNodeStream(buffer: Buffer): NodeJS.ReadableStream {

    return new BufferReadableStream(buffer);

    // const stream = new PassThrough();

    // setTimeout(() => {

    //     // stream.write(buffer);
    //     // stream.end();

    //     // const maxBuffLength = 2048; // 2kB
    //     let maxBuffLength = 100 * 1024; // 100kB

    //     let buff = buffer;
    //     let remaining = buff.length;
    //     let done = 0;

    //     console.log("bufferToStream()  BEFORE: " + remaining);

    //     while (remaining > 0) {

    //         if (done > 0) {
    //             buff = buffer.slice(done);
    //             // remaining === buff.length
    //         }

    //         if (buff.length > maxBuffLength) {
    //             buff = buff.slice(0, maxBuffLength);
    //         }

    //         const res = stream.write(buff);
    //         if (!res) {
    //             console.log("bufferToStream()  highWaterMark");

    //             // Buffer highWaterMark CHECK
    //             if ((stream as any)._writableState) {
    //                 const internalStreamWriteBuffer = (stream as any)._writableState.getBuffer();
    //                 if (internalStreamWriteBuffer) {
    //                     console.log("bufferToStream() _writableState.getBuffer().length: "
    // + internalStreamWriteBuffer.length);
    //                 }
    //             }

    //             // Buffer highWaterMark CHECK
    //             if ((stream as any)._readableState) {
    //                 const internalStreamReadBuffer = (stream as any)._readableState.buffer;
    //                 if (internalStreamReadBuffer) {
    //                     console.log("bufferToStream() _readableState.buffer.length: "
    // + internalStreamReadBuffer.length);
    //                 }
    //             }

    //         }

    //         done += buff.length;
    //         remaining -= buff.length;
    //     }

    //     console.log("bufferToStream()  AFTER: " + done);

    //     stream.end();
    // }, 20);

    // return stream;
}

async function pump(reader: ReadableStreamReader, buffers: Buffer[]): Promise<Buffer> {
    const next = await reader.read();
    if (next.done) {
        return Buffer.concat(buffers);
    }
    buffers.push(Buffer.from(next.value));
    return pump(reader, buffers);
}

export async function streamToBufferPromise(readableStream: ReadableStream): Promise<Buffer> {
    return pump(readableStream.getReader(), []);
}

export async function nodeStreamToBufferPromise(readStream: NodeJS.ReadableStream): Promise<Buffer> {

    return new Promise<Buffer>((resolve, reject) => {

        const buffers: Buffer[] = [];

        readStream.on("error", reject);

        readStream.on("data", (data: Buffer) => {
            buffers.push(data);
        });

        readStream.on("end", () => {
            resolve(Buffer.concat(buffers));
        });
    });
}
