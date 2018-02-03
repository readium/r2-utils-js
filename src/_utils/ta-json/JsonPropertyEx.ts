import "reflect-metadata";

import * as util from "util";

import * as debug_ from "debug";
import { JsonProperty } from "ta-json";
import { getDefinition } from "ta-json/classes/object-definition";

const debug = debug_("r2:utils#ta-json/JsonPropertyEx");

function inspect(obj: any) {
    // breakLength: 100  maxArrayLength: undefined
    console.log(util.inspect(obj,
        { showHidden: false, depth: 1000, colors: true, customInspect: true }));
}

export function JsonPropertyEx(propertyName?: string): (target: any, key: string) => void {

    debug("JsonPropertyEx");

    debug("propertyName");
    debug(propertyName);

    return (target: any, key: string): void => {

        debug("target");
        inspect(target);

        debug("key");
        debug(key);

        debug("Reflect.getMetadata('design:type', target, key)");
        const objectType = Reflect.getMetadata("design:type", target, key);
        inspect(objectType);
        debug(objectType.name);

        debug("target.constructor");
        inspect(target.constructor);

        debug("getDefinition(target.constructor)");
        const objDef = getDefinition(target.constructor);
        inspect(objDef);

        debug("objDef.getProperty(key)");
        const property = objDef.getProperty(key);
        inspect(property);

        return JsonProperty(propertyName)(target, key);
    };
}
