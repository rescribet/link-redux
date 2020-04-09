import { isLiteral, Literal, Quad } from "@ontologies/core";
import xsd from "@ontologies/xsd";
import { equals } from "link-lib";

import {
  OutputTypeFromReturnType,
  ReturnType,
  ToJSOutputTypes,
} from "../../types";

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
function toJS(obj: Literal | unknown): ToJSOutputTypes {
    if (!isLiteral(obj)) {
        return obj as object;
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

export function toReturnType<
  D extends ReturnType,
  R = OutputTypeFromReturnType<D, never>,
>(
  returnType: ReturnType,
  p: Quad,
): R {
    switch (returnType) {
        case ReturnType.Literal:
            return toJS(p.object) as unknown as R;
        case ReturnType.Value:
            return p.object.value as unknown as R;
        case ReturnType.Term:
            return p.object as unknown as R;
        case ReturnType.Statement:
            return p as unknown as R;
      default:
            return p.object as unknown as R;
    }
}

// export function toReturnType<
//   D extends ReturnType,
//   R extends OutputTypeFromReturnType<D, ReturnType.Term> = OutputTypeFromReturnType<D, ReturnType.Term>,
// >(
//   returnType: ReturnType,
//   p: Quad,
// ): R {
//     switch (returnType) {
//         case ReturnType.Literal:
//             return toJS(p.object) as R;
//         case ReturnType.Value:
//             return p.object.value as R;
//         case ReturnType.Term:
//             return p.object as R;
//         case ReturnType.Statement:
//             return p as R;
//       default:
//             return p.object as R;
//     }
// }
