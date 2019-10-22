import rdfFactory, { isLiteral, isNamedNode, Literal, NamedNode, Quad, SomeTerm } from "@ontologies/core";
import xsd from "@ontologies/xsd";
import hoistNonReactStatics from "hoist-non-react-statics";
import { getPropBestLangRaw, normalizeType } from "link-lib";
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
    ToJSOutputTypes,
} from "../types";

import { useCalculateChildProps, useLinkRenderContext } from "./withLinkCtx";

export interface ProcessedLinkOpts extends LinkOpts {
    label: NamedNode[];
    name: string;
}

export interface PropertyBoundProps {
    [k: string]: Quad | Quad[] | SomeTerm | SomeTerm[] | string | string[] | ToJSOutputTypes | undefined;
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
    return (iri as any).term || iri.value.split(/[\/#]/).pop()!.split("?").shift() || "";
}

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
function toJS(obj: Literal | unknown): any {
    if (!isLiteral(obj)) {
        return obj;
    }

    if (rdfFactory.equals(obj.datatype, xsd.boolean)) {
        return obj.value === "true" || obj.value === "1" || obj.value === "t";
    }
    if (rdfFactory.equals(obj.datatype, xsd.dateTime) ||
        rdfFactory.equals(obj.datatype, xsd.date)) {
        return new Date(obj.value);
    }
    if (numberTypes.some((type) => rdfFactory.equals(obj.datatype, type))) {
        return Number(obj.value);
    }

    return obj.value;
}

function toReturnType(returnType: LinkReturnType, p: Quad): Quad | SomeTerm | ToJSOutputTypes {
    switch (returnType) {
        case "literal":
            return toJS(p.object);
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
    const requestedProperties = Array.isArray(mapDataToProps) ? mapDataToProps.map((p) => rdfFactory.id(p)) : [];

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
                requestedProperties.push(...predObj.map((p) => rdfFactory.id(p)));
                propMap[propKey || term(predObj[0])] = {
                    forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                    label: predObj,
                    limit: opts.limit || globalLinkOptsDefaults.limit,
                    name: propKey || term(predObj[0]),
                    returnType: opts.returnType || globalLinkOptsDefaults.returnType,
                };
            } else if (isNamedNode(predObj)) {
                requestedProperties.push(rdfFactory.id(predObj));
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
                    requestedProperties.push(rdfFactory.id(label));
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
        subjProps: Quad[],
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

    return function wrapWithConnect<P>(wrappedComponent: React.ComponentType<P>): ComponentType<any> {
        const comp = React.forwardRef((props: P & PropertyWrappedProps, ref: unknown) => {
            const lrs = useLRS();
            const context = useLinkRenderContext();
            const childProps = useCalculateChildProps({ ...props, innerRef: ref}, context, { lrs: true });
            const subjectData = lrs.tryEntity(childProps.subject);

            const subjProps = subjectData
                .filter((s: Quad) => requestedProperties.includes(rdfFactory.id(s.predicate)));
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
        });

        return hoistNonReactStatics(comp, wrappedComponent);
    };
}
