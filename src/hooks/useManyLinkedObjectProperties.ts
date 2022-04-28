import rdf, { NamedNode, Quadruple } from "@ontologies/core";
import { getPropBestLangRaw, normalizeType } from "link-lib";
import React from "react";

import { globalLinkOptsDefaults } from "../hocs/link/globalLinkOptsDefaults";
import { toReturnType } from "../hocs/link/toReturnType";
import ll from "../ontology/ll";
import {
  ArityPreservingPropSet,
  DataToPropsMapping,
  LinkedDataObject,
  ProcessedLinkOpts,
  ReturnType,
} from "../types";

import { useLRS } from "./useLRS";

const defaultGraph: NamedNode = rdf.defaultGraph();

export function useManyLinkedObjectProperties<
  T extends DataToPropsMapping = {},
  D extends ReturnType = ReturnType.Term,
  OutVal = LinkedDataObject<T, D>,
>(
  propSets: ArityPreservingPropSet[],
  propMap: T,
  returnType?: D,
): OutVal[] {
  const returnTypeOrDefault = returnType ?? globalLinkOptsDefaults.returnType;
  const lrs = useLRS();
  const values = React.useMemo(() => Object.values(propMap), [propMap]);

  return React.useMemo(
    () => {
      const propMaps: OutVal[] = [];

      for (const set of propSets) {
        const acc: any = {};

        if (set === undefined || set[0] === undefined) {
          acc.subject = toReturnType(returnTypeOrDefault, []);
          propMaps.push(acc);
          continue;
        }
        const [s, record] = set as ArityPreservingPropSet<string>;

        const subject = s.includes(":") && !s.startsWith("_:")
            ? rdf.namedNode(s)
            : rdf.blankNode(s);
        acc.subject = toReturnType(
          returnTypeOrDefault,
          [[subject, ll.dataSubject, subject, rdf.defaultGraph()]],
        );

        for (let i = 0, ilen = values.length; i < ilen; i++) {
          const propOpts = values[i] as ProcessedLinkOpts<keyof T>;
          for (let j = 0, jlen = propOpts.label.length; j < jlen; j++) {
            const cur = propOpts.label[j];
            if (acc[propOpts.name]) {
              // TODO: Merge
              continue;
            }

            const field = record[cur.value];
            if (field === undefined) {
              acc[propOpts.name] = toReturnType(propOpts.returnType ?? returnTypeOrDefault, []);
              continue;
            }

            const data: Quadruple[] = normalizeType(field).map((value) => [
              subject,
              cur,
              value,
              defaultGraph,
            ]);

            const best = data.length === 1 ? data[0] : getPropBestLangRaw(data, (lrs.store as any).langPrefs);
            if (data[0] !== best) {
              data[data.indexOf(best)] = data[0];
              data[0] = best;
            }

            acc[propOpts.name] = toReturnType(propOpts.returnType ?? returnTypeOrDefault, data);
          }
        }
        propMaps.push(acc);
      }

      return propMaps;
    },
    [lrs, propSets, values],
  );
}
