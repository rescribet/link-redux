import rdfFactory, { Feature, NamedNode, Quad, SomeTerm } from "@ontologies/core";
import { getPropBestLangRaw } from "link-lib";

import { ReturnType, ToJSOutputTypes } from "../types";

import { DataToPropsMapping } from "../hocs/link/dataPropsToPropMap";
import { toReturnType } from "../hocs/link/toReturnType";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useLRS } from "./useLRS";

export interface PropertyBoundProps {
    [k: string]: Quad | Quad[] | SomeTerm | SomeTerm[] | string | string[] | ToJSOutputTypes | undefined;
}

const createFilter = rdfFactory.supports[Feature.identity]
  ? (cur: NamedNode) => (s: Quad) => s.predicate.id === cur.id
  : (cur: NamedNode) => (s: Quad) => rdfFactory.id(s.predicate) === rdfFactory.id(cur);

export function useLinkedObjectProperties(
    subjProps: Quad[],
    propMap: DataToPropsMapping,
    returnType: ReturnType,
): PropertyBoundProps {
    const lrs = useLRS();
    const context = useLinkRenderContext();

    const acc: PropertyBoundProps = {};

    const values = Object.values(propMap);
    for (let i = 0; i < values.length; i++) {
      const propOpts = values[i];
      for (let j = 0; j < propOpts.label.length; j++) {
        const cur = propOpts.label[j];
        if (acc[propOpts.name]) {
          // TODO: Merge
          continue;
        }

        if (propOpts.limit === 1) {
          const p = getPropBestLangRaw(
            lrs.getResourcePropertyRaw(context.subject, cur),
            (lrs as any).store.langPrefs,
          );
          if (p) {
            acc[propOpts.name] = toReturnType(returnType, p);
          }
        } else {
          const nextName = [];
          const filter = createFilter(cur);
          for (let k = 0; k < subjProps.length; k++) {
            if (filter(subjProps[k])) {
              nextName.push(toReturnType(returnType, subjProps[k]));
            }
          }
          acc[propOpts.name] = nextName;
        }
      }
    }

    return acc;
}
