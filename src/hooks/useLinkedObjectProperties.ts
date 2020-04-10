import { Quad } from "@ontologies/core";

import {
  DataToPropsMapping,
  LinkedDataObject,
  ReturnType,
} from "../types";

import { useManyLinkedObjectProperties } from "./useManyLinkedObjectProperties";

export function useLinkedObjectProperties<
  T extends DataToPropsMapping = DataToPropsMapping,
  D extends ReturnType = ReturnType,
>(
    subjProps: Quad[],
    propMap: T,
    returnType: D,
): LinkedDataObject<T, D> | undefined {
    const [data] = useManyLinkedObjectProperties([subjProps], propMap, returnType);

    return data;
}
