import rdfFactory, { isLiteral, Literal, Quad, SomeTerm } from "@ontologies/core";
import xsd from "@ontologies/xsd";
import { LinkReturnType, ToJSOutputTypes } from "../../types";

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

    if (rdfFactory.equals(obj.datatype, xsd.boolean)) {
        return obj.value === "true" || obj.value === "1" || obj.value === "t";
    }
    if (rdfFactory.equals(obj.datatype, xsd.dateTime) ||
        rdfFactory.equals(obj.datatype, xsd.date)) {
        return new Date(obj.value);
    }
    if (numberTypes.some((type) => rdfFactory.equals(obj.datatype, type))) {
        return Number(obj.value);
    }

    return obj.value;
}

export function toReturnType(returnType: LinkReturnType, p: Quad): Quad | SomeTerm | ToJSOutputTypes {
    switch (returnType) {
        case "literal":
            return toJS(p.object);
        case "value":
            return p.object.value;
        case "term":
            return p.object;
        case "statement":
            return p;
    }
}
