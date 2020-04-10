import rdf, { Quad } from "@ontologies/core";
import { equals, getPropBestLangRaw } from "link-lib";
import React from "react";
import { ProcessedLinkOpts } from "../hocs/link";

import { DataToPropsMapping } from "../hocs/link/dataPropsToPropMap";
import { globalLinkOptsDefaults } from "../hocs/link/globalLinkOptsDefaults";
import { toReturnType } from "../hocs/link/toReturnType";
import ll from "../ontology/ll";
import { LinkedDataObject, ReturnType } from "../types";

import { useLRS } from "./useLRS";

export function useManyLinkedObjectProperties<
  T extends DataToPropsMapping = {},
  D extends ReturnType = ReturnType.Term,
>(
  subjPropsArr: Quad[][],
  propMap: T,
  returnType?: D,
): Array<LinkedDataObject<T, D>> {
  type DataObjectType = LinkedDataObject<T, D>;

  const returnTypeOrDefault = returnType || globalLinkOptsDefaults.returnType;
  const lrs = useLRS();
  const values = React.useMemo(() => Object.values(propMap), [propMap]);
  const length = subjPropsArr.length;

  return React.useMemo(
    () => {
      const propMaps: DataObjectType[] = [];

      for (let h = 0; h < length; h++) {
        const subjProps = subjPropsArr[h];
        const subject = subjProps[0].subject;
        const acc: Partial<DataObjectType> = {};

        acc.subject = toReturnType(
          returnTypeOrDefault,
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

            const data: Quad[] = [];
            for (let k = 0, klen = subjProps.length; k < klen; k++) {
              if (equals(subjProps[k].predicate, cur)) {
                data.push(subjProps[k]);
              }
            }
            const best = data.length === 1 ? data[0] : getPropBestLangRaw(data, (lrs.store as any).langPrefs);
            if (data[0] !== best) {
              data[data.indexOf(best)] = data[0];
              data[0] = best;
            }

            acc[propOpts.name] = toReturnType(
              propOpts.returnType || returnTypeOrDefault,
              propOpts.limit !== Infinity  ? data.slice(0, propOpts.limit) : data,
            );
          }
        }
        propMaps.push(acc as DataObjectType);
      }

      return propMaps;
    },
    [lrs, subjPropsArr, values],
  );
}
