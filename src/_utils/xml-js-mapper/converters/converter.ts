// ==LICENSE-BEGIN==
// Copyright 2017 European Digital Reading Lab. All rights reserved.
// Licensed to the Readium Foundation under one or more contributor license agreements.
// Use of this source code is governed by a BSD-style license
// that can be found in the LICENSE file exposed on Github (readium) in the project repository.
// ==LICENSE-END==

import { FunctionType } from "../types";
import { BufferConverter } from "./buffer-converter";
import { DateConverter } from "./date-converter";

export interface IPropertyConverter {
    serialize(property: any): string;
    deserialize(value: string): any;
}

export const propertyConverters: Map<FunctionType, IPropertyConverter> = new Map<FunctionType, IPropertyConverter>();

propertyConverters.set(Buffer, new BufferConverter());
propertyConverters.set(Date, new DateConverter());
