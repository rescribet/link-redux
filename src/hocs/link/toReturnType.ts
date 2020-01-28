import { isLiteral, Literal, Quad, SomeTerm } from "@ontologies/core";
import xsd from "@ontologies/xsd";

import { equals } from "../../factoryHelpers";
import { ReturnType, ToJSOutputTypes } from "../../types";

const numberTypes = [
    xsd.integer,
    xsd.int,
    xsd.unsignedInt,
    xsd.short,
    xsd.unsignedShort,
    xsd.byte,
    xsd.unsignedByte,
    xsd.float,
    xsd.decimal,
];

// From rdflib.js with modifications
function toJS(obj: Literal | unknown): any {
    if (!isLiteral(obj)) {
        return obj;
    }

    if (equals(obj.datatype, xsd.boolean)) {
        return obj.value === "true" || obj.value === "1" || obj.value === "t";
    }
    if (equals(obj.datatype, xsd.dateTime) ||
        equals(obj.datatype, xsd.date)) {
        return new Date(obj.value);
    }
    if (numberTypes.some((type) => equals(obj.datatype, type))) {
        return Number(obj.value);
    }

    return obj.value;
}

export function toReturnType(returnType: ReturnType, p: Quad): Quad | SomeTerm | ToJSOutputTypes {
    switch (returnType) {
        case ReturnType.Literal:
            return toJS(p.object);
        case ReturnType.Value:
            return p.object.value;
        case ReturnType.Term:
            return p.object;
        case ReturnType.Statement:
            return p;
    }
}
