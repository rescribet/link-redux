import rdfFactory, { Quad, SomeTerm } from "@ontologies/core";
import { getPropBestLangRaw } from "link-lib";

import { LinkReduxLRSType, LinkRenderContext, LinkReturnType, ToJSOutputTypes } from "../../types";

import { DataToPropsMapping } from "./dataPropsToPropMap";
import { toReturnType } from "./toReturnType";

export interface PropertyBoundProps {
    [k: string]: Quad | Quad[] | SomeTerm | SomeTerm[] | string | string[] | ToJSOutputTypes | undefined;
}

export function getLinkedObjectProperties(
    lrs: LinkReduxLRSType,
    context: LinkRenderContext,
    subjProps: Quad[],
    propMap: DataToPropsMapping,
    returnType: LinkReturnType,
): PropertyBoundProps {
    const acc: PropertyBoundProps = {};

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
                    .map(
                        (s: Quad) => toReturnType(returnType, s),
                    ) as Quad[] | SomeTerm[] | string[];
            }
        }
    }

    return acc;
}
