import * as ReactPropTypes from "prop-types";
import { NamedNode, SomeTerm, Statement } from "rdflib";
import * as React from "react";

import { lrsType, subjectType } from "../propTypes";
import { LabelType, LinkedPropType, VersionProp } from "../types";

import { linkedSubject } from "./linkedSubject";
import { linkedVersion } from "./linkedVersion";

export type LinkReturnType = "term" | "statement" | "value";

export interface LinkOpts {
    forceRender?: boolean;
    label?: LabelType;
    limit?: number;
    linkedProp?: LinkedPropType;
    name?: string;
    returnType?: LinkReturnType;
}
export interface ProcessedLinkOpts extends LinkOpts {
    label: NamedNode;
    name: string;
}

export interface MapDataToPropsParamObject {
    [k: string]: NamedNode | NamedNode[] | LinkOpts;
}

export interface PropertyBoundProps {
    [k: string]: Statement | Statement[] | SomeTerm | SomeTerm[] | string | string[] | undefined;
}

interface DataToPropsMapping {
    [k: string]: ProcessedLinkOpts;
}

export type MapDataToPropsParam = MapDataToPropsParamObject | NamedNode[];

const globalLinkOptsDefaults = {
    forceRender: false,
    label: undefined,
    limit: 1,
    name: undefined,
    returnType: "term",
} as LinkOpts;

function toReturnType(returnType: LinkReturnType, p: Statement): Statement | SomeTerm | string {
    switch (returnType) {
        case "value":
            return p.object.value;
        case "term":
            return p.object;
        case "statement":
            return p;
    }
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
export function link(mapDataToProps: MapDataToPropsParam,
                     opts: LinkOpts = globalLinkOptsDefaults): (p: React.ComponentType) => React.ReactType {

    const propMap: DataToPropsMapping = {};
    const requestedProperties = Array.isArray(mapDataToProps) ? mapDataToProps.map((p) => p.sI) : [];

    if (Array.isArray(mapDataToProps)) {
        if (mapDataToProps.length === 0) {
            throw new TypeError("Props array must contain at least one predicate");
        }
        mapDataToProps.forEach((prop) => {
            propMap[prop.sI] = {
                forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                label: prop,
                limit: opts.limit || globalLinkOptsDefaults.limit,
                name: prop.term,
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
                    propMap[prop.sI] = {
                        forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                        label: prop,
                        limit: opts.limit || globalLinkOptsDefaults.limit,
                        name: prop.term,
                        returnType: opts.returnType || globalLinkOptsDefaults.returnType,
                    };
                });
            } else if (predObj instanceof NamedNode) {
                requestedProperties.push(predObj.sI);
                propMap[predObj.sI] = {
                    forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                    label: predObj,
                    limit: opts.limit || globalLinkOptsDefaults.limit,
                    name: propKey || predObj.term,
                };
            } else {
                if (predObj.label === undefined || Array.isArray(predObj.label)) {
                    throw new TypeError("Inner opts label must be a single NamedNode");
                }
                requestedProperties.push(predObj.label!.sI);
                propMap[predObj.label!.sI] = {
                    forceRender: predObj.forceRender || opts.forceRender || globalLinkOptsDefaults.forceRender,
                    label: predObj.label,
                    limit: predObj.limit || opts.limit || globalLinkOptsDefaults.limit,
                    linkedProp: predObj.linkedProp || opts.linkedProp || globalLinkOptsDefaults.linkedProp,
                    name: predObj.name || predObj.label.term,
                    returnType: predObj.returnType || opts.returnType || globalLinkOptsDefaults.returnType,
                } as ProcessedLinkOpts;
            }
        }
    }

    if (requestedProperties.length === 0) {
        throw new TypeError("Props array must contain at least one predicate");
    }

    const returnType = opts.returnType || "term";

    return function wrapWithConnect(wrappedComponent: React.ComponentType<any>) {
        class Link<T extends VersionProp> extends React.Component<any> {

            public static contextTypes = {
                linkedRenderStore: lrsType,
            };
            public static displayName = `Link(${wrappedComponent.name})`;
            public static propTypes = {
                subject: subjectType,
                version: ReactPropTypes.string,
            };

            public render() {
                const props = this.context
                    .linkedRenderStore
                    .tryEntity(this.props.subject)
                    .filter((s: Statement) => requestedProperties.includes(s.predicate.sI));
                if ((this.props.forceRender || opts.forceRender) !== true && props.length === 0) {
                    return null;
                }

                return React.createElement(
                    wrappedComponent,
                    { ...this.props, ...this.getLinkedObjectProperties(props) },
                );
            }

            private getLinkedObjectProperties(props: Statement[]): PropertyBoundProps {
                return requestedProperties.reduce((acc: PropertyBoundProps, cur) => {
                    const propOpts = propMap[cur];

                    if (propOpts.limit === 1) {
                        const p = props.find((s: Statement) => s.predicate.sI === cur);
                        if (p) {
                            acc[propOpts.name] = toReturnType(returnType, p);
                        }
                    } else {
                        acc[propOpts.name] = props
                            .filter((s: Statement) => s.predicate.sI === cur)
                            .map((s: Statement) => toReturnType(returnType, s)) as Statement[] | SomeTerm[] | string[];
                    }

                    return acc;
                }, {});
            }
        }

        return linkedSubject(linkedVersion(Link as React.ComponentType<any>));
    };
}
