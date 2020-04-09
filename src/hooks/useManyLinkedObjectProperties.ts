import rdf, { Quad } from "@ontologies/core";
import { getPropBestLangRaw } from "link-lib";
import React from "react";
import { ProcessedLinkOpts } from "../hocs/link";

import { DataToPropsMapping } from "../hocs/link/dataPropsToPropMap";
import { globalLinkOptsDefaults } from "../hocs/link/globalLinkOptsDefaults";
import { toReturnType } from "../hocs/link/toReturnType";
import ll from "../ontology/ll";
import {
  LinkedDataObject, OutputTypeFromOpts, OutputTypeFromReturnType,
  ReturnType, ReturnValueTypes,
  SubjectProp,
} from "../types";

import { useLRS } from "./useLRS";

export function useManyLinkedObjectProperties<
  T extends DataToPropsMapping = {},
>(
  subjPropsArr: Quad[][],
  propMap: T,
  returnType: ReturnType = globalLinkOptsDefaults.returnType,
): Array<LinkedDataObject<T, typeof returnType>> {
  type DataObjectType = LinkedDataObject<T, typeof returnType>;
  const lrs = useLRS();
  const values = React.useMemo(() => Object.values(propMap), [propMap]);
  const length = subjPropsArr.length;

  return React.useMemo(
    () => {
      const propMaps: Array<DataObjectType & SubjectProp> = [];

      for (let h = 0; h < length; h++) {
        const subjProps = subjPropsArr[h];
        const subject = subjProps[0].subject;
        const acc: Partial<DataObjectType> = {};

        acc.subject = toReturnType(
          returnType,
          rdf.quad(subject, ll.nop, subject),
        );

        for (let i = 0, ilen = values.length; i < ilen; i++) {
          const propOpts = values[i] as ProcessedLinkOpts<keyof T>;
          for (let j = 0, jlen = propOpts.label.length; j < jlen; j++) {
            const cur = propOpts.label[j];
            if (acc[propOpts.name]) {
              // TODO: Merge
              continue;
            }
            if (propOpts.limit === 1) {
              const p = getPropBestLangRaw(
                lrs.getResourcePropertyRaw(subject, cur),
                (lrs.store as any).langPrefs,
              );
              if (p) {
                acc[propOpts.name] = toReturnType(propOpts.returnType || returnType, p);
              }
            } else {
              const nextName: Array<OutputTypeFromReturnType<typeof returnType>> = [];
              for (let k = 0, klen = subjProps.length; k < klen; k++) {
                if (subjProps[k].predicate === cur) {
                  nextName.push(toReturnType(propOpts.returnType || returnType, subjProps[k]));
                }
              }
              acc[propOpts.name] = nextName;
            }
          }
        }
        propMaps.push(acc as DataObjectType);
      }

      return propMaps;
    },
    [lrs, subjPropsArr, values],
  );
}
