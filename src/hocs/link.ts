import hoistNonReactStatics from "hoist-non-react-statics";
import { getPropBestLangRaw, normalizeType } from "link-lib";
import { NamedNode, Node, SomeTerm, Statement, ToJSOutputTypes } from "rdflib";
import { ComponentType } from "react";
import * as React from "react";

import { PropertyWrappedProps } from "../components/Property";
import { useDataInvalidation } from "../hooks/useDataInvalidation";
import { useLRS } from "../hooks/useLRS";
import {
    LinkOpts,
    LinkReduxLRSType,
    LinkRenderContext,
    LinkReturnType,
    MapDataToPropsParam,
} from "../types";

import { useCalculateChildProps, useLinkRenderContext } from "./withLinkCtx";

export interface ProcessedLinkOpts extends LinkOpts {
    label: NamedNode[];
    name: string;
}

export interface PropertyBoundProps {
    [k: string]: Statement | Statement[] | SomeTerm | SomeTerm[] | string | string[] | ToJSOutputTypes | undefined;
}

interface DataToPropsMapping {
    [k: string]: ProcessedLinkOpts;
}

const globalLinkOptsDefaults = {
    forceRender: false,
    label: undefined,
    limit: 1,
    name: undefined,
    returnType: "term",
} as LinkOpts;

function term(iri: NamedNode): string {
    return iri.term || iri.value.split(/[\/#]/).pop()!.split("?").shift() || "";
}

function toReturnType(returnType: LinkReturnType, p: Statement): Statement | SomeTerm | ToJSOutputTypes {
    switch (returnType) {
        case "literal":
            return Node.toJS(p.object);
        case "value":
            return p.object.value;
        case "term":
            return p.object;
        case "statement":
            return p;
    }
}

export function dataPropsToPropMap(mapDataToProps: MapDataToPropsParam,
                                   opts: LinkOpts): [DataToPropsMapping, number[]] {

    const propMap: DataToPropsMapping = {};
    const requestedProperties = Array.isArray(mapDataToProps) ? mapDataToProps.map((p) => p.sI) : [];

    if (Array.isArray(mapDataToProps)) {
        if (mapDataToProps.length === 0) {
            throw new TypeError("Props array must contain at least one predicate");
        }
        mapDataToProps.forEach((prop) => {
            propMap[term(prop)] = {
                forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                label: [prop],
                limit: opts.limit || globalLinkOptsDefaults.limit,
                name: term(prop),
            };
        });
    } else {
        for (const propKey in mapDataToProps) {
            if (!mapDataToProps.hasOwnProperty(propKey)) {
                continue;
            }
            const predObj = mapDataToProps[propKey];
            if (Array.isArray(predObj)) {
                if (predObj.length === 0) {
                    throw new TypeError("Props array must contain at least one predicate");
                }
                predObj.forEach((prop) => {
                    requestedProperties.push(prop.sI);
                    propMap[propKey || term(prop)] = {
                        forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                        label: [prop],
                        limit: opts.limit || globalLinkOptsDefaults.limit,
                        name: propKey || term(prop),
                        returnType: opts.returnType || globalLinkOptsDefaults.returnType,
                    };
                });
            } else if (predObj instanceof NamedNode) {
                requestedProperties.push(predObj.sI);
                propMap[propKey || term(predObj)] = {
                    forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                    label: [predObj],
                    limit: opts.limit || globalLinkOptsDefaults.limit,
                    name: propKey || term(predObj),
                };
            } else {
                if (predObj.label === undefined) {
                    throw new TypeError("Inner opts label must be a single NamedNode");
                }
                const labelArr = Array.isArray(predObj.label) ? predObj.label : [predObj.label];

                labelArr.forEach((label) => {
                    requestedProperties.push(label.sI);
                });
                propMap[propKey || predObj.name || term(labelArr[0])] = {
                    forceRender: predObj.forceRender || opts.forceRender || globalLinkOptsDefaults.forceRender,
                    label: normalizeType(predObj.label),
                    limit: predObj.limit || opts.limit || globalLinkOptsDefaults.limit,
                    linkedProp: predObj.linkedProp || opts.linkedProp || globalLinkOptsDefaults.linkedProp,
                    name: propKey || predObj.name || term(labelArr[0]),
                    returnType: predObj.returnType || opts.returnType || globalLinkOptsDefaults.returnType,
                } as ProcessedLinkOpts;
            }
        }
    }

    return [ propMap, requestedProperties ];
}

/**
 * Binds a react component to data properties.
 *
 * The current implementation only supports a one-dimensional array of NamedNode objects. And binds
 * the underlying values to the `props` object with each predicate term as the key.
 *
 * @example
 * ```
 *
 *   const BlogPost = (props) => (
 *     <div>
 *         <h1>{props.name.value}</h1>
 *         <p>{props.text.value}</p>
 *         <LinkedResourceContainer subject={props.author} />
 *     </div
 *   )
 *
 *   link([NS.schema("name"), NS.schema("text"), NS.schema("author")])(BlogPost)
 * ```
 * @param {NamedNode[]} mapDataToProps The properties to bind to the component, only NamedNode[] is currently supported.
 * @param {LinkOpts} opts Adjust the default behaviour, these are not yet guaranteed.
 */
export function link(mapDataToProps: MapDataToPropsParam, opts: LinkOpts = globalLinkOptsDefaults):
    <P>(p: React.ComponentType<P>) => React.ComponentType<P> {

    const [ propMap, requestedProperties ] = dataPropsToPropMap(mapDataToProps, opts);

    if (requestedProperties.length === 0) {
        throw new TypeError("Props array must contain at least one predicate");
    }

    const returnType = opts.returnType || "term";

    function getLinkedObjectProperties(
        lrs: LinkReduxLRSType,
        context: LinkRenderContext,
        subjProps: Statement[],
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
                        .filter((s: Statement) => s.predicate.sI === cur.sI)
                        .map(
                            (s: Statement) => toReturnType(returnType, s),
                        ) as Statement[] | SomeTerm[] | string[];
                }
            }
        }

        return acc;
    }

    return function wrapWithConnect<P>(wrappedComponent: React.ComponentType<P>): ComponentType<any> {
        const comp = (props: P & PropertyWrappedProps) => {
            const lrs = useLRS();
            const context = useLinkRenderContext();
            const childProps = useCalculateChildProps(props, context, { lrs: true });
            const subjectData = lrs.tryEntity(childProps.subject);

            const subjProps = subjectData
                .filter((s: Statement) => requestedProperties.includes(s.predicate.sI));
            const mappedProps = {
                ...childProps,
                ...getLinkedObjectProperties(lrs, context, subjProps),
            };

            const linkVersion = useDataInvalidation(mappedProps);

            if ((props.forceRender || opts.forceRender) !== true && subjProps.length === 0) {
                return null;
            }

            return React.createElement(
                wrappedComponent,
                {
                    ...mappedProps,
                    linkVersion,
                },
            );
        };

        return hoistNonReactStatics(comp, wrappedComponent);
    };
}
