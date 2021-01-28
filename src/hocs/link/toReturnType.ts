import { isLiteral, Literal, Quad } from "@ontologies/core";
import * as xsd from "@ontologies/xsd";
import { equals, normalizeType } from "link-lib";

import {
  OutputTypeFromReturnType,
  ReturnType,
  ToJSOutputTypes,
} from "../../types";

const numberTypes = [
    xsd.integer,
    xsd.xsdint,
    xsd.unsignedInt,
    xsd.xsdshort,
    xsd.unsignedShort,
    xsd.xsdbyte,
    xsd.unsignedByte,
    xsd.xsdfloat,
    xsd.decimal,
];

// From rdflib.js with modifications
function toJS(obj: Literal | unknown): ToJSOutputTypes {
    if (!isLiteral(obj)) {
        return obj as object;
    }

    if (equals(obj.datatype, xsd.xsdboolean)) {
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

export function toReturnType<
  D extends ReturnType,
  R = OutputTypeFromReturnType<D, never>,
>(
  returnType: ReturnType,
  p: Quad | Quad[],
): R {
    const stmts = normalizeType(p);
    switch (returnType) {
        case ReturnType.Literal:
            return toJS(stmts[0]?.object) as unknown as R;
        case ReturnType.Value:
            return stmts[0]?.object.value as unknown as R;
        case ReturnType.Term:
            return stmts[0]?.object as unknown as R;
        case ReturnType.Statement:
            return stmts[0] as unknown as R;

        case ReturnType.AllLiterals:
          return stmts.map((s) => toJS(s.object)) as unknown as R;
        case ReturnType.AllValues:
          return stmts.map((s) => s.object.value) as unknown as R;
        case ReturnType.AllTerms:
          return stmts.map((s) => s.object) as unknown as R;
        case ReturnType.AllStatements:
          return stmts as unknown as R;

        default:
            throw new TypeError(`Unknown returnType '${returnType}' given`);
    }
}
