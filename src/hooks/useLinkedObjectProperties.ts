import rdfFactory, { Quad, SomeTerm } from "@ontologies/core";
import { getPropBestLangRaw } from "link-lib";

import { ReturnType, ToJSOutputTypes } from "../types";

import { DataToPropsMapping } from "../hocs/link/dataPropsToPropMap";
import { toReturnType } from "../hocs/link/toReturnType";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useLRS } from "./useLRS";

type Test = Quad | Quad[] | SomeTerm | SomeTerm[] | string | string[] | ToJSOutputTypes | undefined;

export type PropertyBoundProps<T> = { [K in keyof T]: Test };

export function useLinkedObjectProperties(
    subjProps: Quad[],
    propMap: DataToPropsMapping,
    returnType: ReturnType,
): PropertyBoundProps<typeof propMap> {
    const lrs = useLRS();
    const context = useLinkRenderContext();

    const acc: PropertyBoundProps<typeof propMap> = {};

    for (const propOpts of Object.values(propMap)) {
        for (const cur of propOpts.label) {
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
                acc[propOpts.name] = subjProps
                    .filter((s: Quad) => rdfFactory.id(s.predicate) === rdfFactory.id(cur))
                    .map((s: Quad) => toReturnType(returnType, s)) as Quad[] | SomeTerm[] | string[];
            }
        }
    }

    return acc;
}
