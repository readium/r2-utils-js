// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

// import * as fs from "fs";

import { isDirectory, isHTTP } from "../http/UrlUtils";
import { IZip } from "./zip";
// import { ZipExploded } from "./zip-ex";
// import { Zip1 } from "./zip1";
// import { Zip2 } from "./zip2";
import { Zip5 } from "./zip5";

// export async function zipLoadPromise(filePath: string): Promise<IZip> {
//     if (isHTTP(filePath)) {
//         return Zip2.loadPromise(filePath);
//     }
//
//     const stats = fs.lstatSync(filePath);
//     if (stats.isDirectory()) {
//         return ZipExploded.loadPromise(filePath);
//     }
//
//     return Zip1.loadPromise(filePath);
// }

export async function zipLoadPromise(filePath: string): Promise<IZip> {
    const http = isHTTP(filePath);
    const dir = isDirectory(filePath);

    if (http && !dir) {
        // HTTP url to a zip file
        // return Zip2.loadPromise(filePath);
        throw new Error("not implemented");
    } else if (!dir) {
        // Path to a zip file
        // return Zip1.loadPromise(filePath);
        throw new Error("not implemented");
    } else if (http) {
        // HTTP url to an exploded (uncompressed) directory
        return Zip5.loadPromise(filePath);
    }

    // Path to an exploded (uncompressed) directory
    // return ZipExploded.loadPromise(filePath);
    throw new Error("not implemented");
}
