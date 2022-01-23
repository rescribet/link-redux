import { DataRecord, Id } from "link-lib";

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
    subjProps: Array<[Id, DataRecord]>,
    propMap: T,
    returnType: D,
): LinkedDataObject<T, D> | undefined {
    const [data] = useManyLinkedObjectProperties(subjProps, propMap, returnType);

    return data;
}
