var fs = require("fs");
var path = require("path");
var filehound = require("filehound");

const LICENSE_HEADER_BEGIN = "// ==LICENSE-BEGIN==";
const LICENSE_HEADER_END = "// ==LICENSE-END==";
const LICENSE_HEADER = LICENSE_HEADER_BEGIN + `
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
` + LICENSE_HEADER_END + `

`;

console.log(`process.cwd(): ${process.cwd()}`);
console.log(`__dirname: ${__dirname}`);

const args = process.argv.slice(2);
console.log("process.argv.slice(2): %o", args);

if (!args[0]) {
    console.log("FILEPATH ARGUMENT IS MISSING.");
    process.exit(1);
}

const argPath = args[0].trim();
let filePath = argPath;
console.log(`path: ${filePath}`);

if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, argPath);
    console.log(`path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), argPath);
        console.log(`path: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            console.log("FILEPATH DOES NOT EXIST.");
            process.exit(1);
        }
    }
}

filePath = fs.realpathSync(filePath);
console.log(`path (normalized): ${filePath}`);

const stats = fs.lstatSync(filePath);

if (!stats.isFile() && !stats.isDirectory()) {
    console.log("FILEPATH MUST BE FILE OR DIRECTORY.");
    process.exit(1);
}

function processFile(filePath) {
    console.log(">>>>>>>>>>>>> " + filePath);
    let fileTxt = fs.readFileSync(filePath, { encoding: "utf8" });

    const regex = new RegExp("^" + LICENSE_HEADER_BEGIN + "[\\s\\S]*" + LICENSE_HEADER_END + "$", "gm");
    let regexMatch = regex.exec(fileTxt);
    while (regexMatch) {
        console.log("FOUND EXISTING LICENSE HEADER:");
        console.log(regexMatch[0]);
        fileTxt = fileTxt.replace(regexMatch[0], "").trimLeft();
        console.log("--8<----------------");
        console.log(fileTxt.substr(0, 100));
        console.log("...");
        console.log("--8<----------------");

        break; // just the first occurence
        // regexMatch = regex.exec(fileTxt); // loop
    }

    fileTxt = LICENSE_HEADER + fileTxt;
    console.log(fileTxt.substr(0, 500));
    fs.writeFileSync(filePath, fileTxt, { encoding: "utf8" });
}

if (stats.isDirectory()) {
    console.log("Analysing directory...");

    // tslint:disable-next-line:no-floating-promises
    (async () => {
        const files = await filehound.create()
            .discard("node_modules")
            .depth(50)
            .paths(filePath)
            .ext([".ts", ".tsx"])
            .find();
        for (const file of files) {
            processFile(file);
        }
    })();

} else {
    const ext = path.extname(filePath).toLowerCase();
    const isTS = /\.ts[x]?$/.test(ext);

    if (isTS) {
        processFile(filePath);
    } else {
        console.log("FILE WRONG EXTENSION (should be *.ts)");
    }
}
