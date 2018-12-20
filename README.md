# NodeJS / TypeScript Readium-2 "utils"

NodeJS implementation (written in TypeScript) of utilities for the Readium2 architecture ( https://github.com/readium/architecture/ ).

[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](/LICENSE)

## Build status

[![NPM](https://img.shields.io/npm/v/r2-utils-js.svg)](https://www.npmjs.com/package/r2-utils-js) [![David](https://david-dm.org/readium/r2-utils-js/status.svg)](https://david-dm.org/readium/r2-utils-js)

[Changelog](/CHANGELOG.md)

## Prerequisites

1) https://nodejs.org NodeJS >= 8, NPM >= 5 (check with command line `node --version` and `npm --version`)
2) OPTIONAL: https://yarnpkg.com Yarn >= 1.0 (check with command line `yarn --version`)

## GitHub repository

https://github.com/readium/r2-utils-js

There is no [github.io](https://readium.github.io/r2-utils-js) site for this project (no [gh-pages](https://github.com/readium/r2-utils-js/tree/gh-pages) branch).

## NPM package

https://www.npmjs.com/package/r2-utils-js

Command line install:

`npm install r2-utils-js`
OR
`yarn add r2-utils-js`

...or manually add in your `package.json`:
```json
  "dependencies": {
    "r2-utils-js": "latest"
  }
```

The JavaScript code distributed in the NPM package is usable as-is (no transpilation required), as it is automatically-generated from the TypeScript source.

Several ECMAScript flavours are provided out-of-the-box: ES5, ES6-2015, ES7-2016, ES8-2017:

https://unpkg.com/r2-utils-js/dist/

(alternatively, GitHub mirror with semantic-versioning release tags: https://github.com/edrlab/r2-utils-js-dist/tree/develop/dist/ )

The JavaScript code is not bundled, and it uses `require()` statement for imports (NodeJS style).

More information about NodeJS compatibility:

http://node.green

Note that web-browser Javascript is currently not supported (only NodeJS runtimes).

The type definitions (aka "typings") are included as `*.d.ts` files in `./node_modules/r2-utils-js/dist/**`, so this package can be used directly in a TypeScript project.

Example usage:

```javascript
// currently no index file
// import { * } from "r2-utils-js";

// ES5 import (assuming node_modules/r2-utils-js/):
import { sortObject } from "r2-utils-js/dist/es5/src/_utils/JsonUtils";

// ... or alternatively using a convenient path alias in the TypeScript config (+ WebPack etc.):
import { sortObject } from "@r2-utils-js/JsonUtils";
```

## Dependencies

https://david-dm.org/readium/r2-utils-js

A [package-lock.json](https://github.com/readium/r2-utils-js/blob/develop/package-lock.json) is provided (modern NPM replacement for `npm-shrinkwrap.json`).

A [yarn.lock](https://github.com/readium/r2-utils-js/blob/develop/yarn.lock) file is currently *not* provided at the root of the source tree.

## Continuous Integration

TODO (unit tests?)
https://travis-ci.org/readium/r2-utils-js

Badge: `[![Travis](https://travis-ci.org/readium/r2-utils-js.svg?branch=develop)](https://travis-ci.org/readium/r2-utils-js)`

## Version(s), Git revision(s)

NPM package (latest published):

https://unpkg.com/r2-utils-js/dist/gitrev.json

Alternatively, GitHub mirror with semantic-versioning release tags:

https://raw.githack.com/edrlab/r2-utils-js-dist/develop/dist/gitrev.json

## Developer quick start

Command line steps (NPM, but similar with YARN):

1) `cd r2-utils-js`
2) `git status` (please ensure there are no local changes, especially in `package-lock.json` and the dependency versions in `package.json`)
3) `rm -rf node_modules` (to start from a clean slate)
4) `npm install`, or alternatively `npm ci` (both commands initialize the `node_modules` tree of package dependencies, based on the strict `package-lock.json` definition)
5) `npm run build:all` (invoke the main build script: clean, lint, compile)
6) `ls dist` (that's the build output which gets published as NPM package)

## Documentation

TODO
