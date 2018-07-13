import { getPropBestLangRaw, normalizeType } from "link-lib";
import * as ReactPropTypes from "prop-types";
import { NamedNode, Node, SomeTerm, Statement, ToJSOutputTypes } from "rdflib";
import { ComponentType } from "react";
import * as React from "react";

import { lrsType, subjectType } from "../propTypes";
import { LinkOpts, LinkReturnType, MapDataToPropsParam } from "../types";

import { withLinkCtx } from "./withLinkCtx";

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

    const propMap: DataToPropsMapping = {};
    const requestedProperties = Array.isArray(mapDataToProps) ? mapDataToProps.map((p) => p.sI) : [];

    if (Array.isArray(mapDataToProps)) {
        if (mapDataToProps.length === 0) {
            throw new TypeError("Props array must contain at least one predicate");
        }
        mapDataToProps.forEach((prop) => {
            propMap[prop.term] = {
                forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                label: [prop],
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
                    propMap[prop.term] = {
                        forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                        label: [prop],
                        limit: opts.limit || globalLinkOptsDefaults.limit,
                        name: prop.term,
                        returnType: opts.returnType || globalLinkOptsDefaults.returnType,
                    };
                });
            } else if (predObj instanceof NamedNode) {
                requestedProperties.push(predObj.sI);
                propMap[propKey || predObj.term] = {
                    forceRender: opts.forceRender || globalLinkOptsDefaults.forceRender,
                    label: [predObj],
                    limit: opts.limit || globalLinkOptsDefaults.limit,
                    name: propKey || predObj.term,
                };
            } else {
                if (predObj.label === undefined) {
                    throw new TypeError("Inner opts label must be a single NamedNode");
                }
                const labelArr = Array.isArray(predObj.label) ? predObj.label : [predObj.label];

                labelArr.forEach((label) => {
                    requestedProperties.push(label.sI);
                });
                propMap[propKey || predObj.name || labelArr[0].term] = {
                    forceRender: predObj.forceRender || opts.forceRender || globalLinkOptsDefaults.forceRender,
                    label: normalizeType(predObj.label),
                    limit: predObj.limit || opts.limit || globalLinkOptsDefaults.limit,
                    linkedProp: predObj.linkedProp || opts.linkedProp || globalLinkOptsDefaults.linkedProp,
                    name: propKey || predObj.name || labelArr[0].term,
                    returnType: predObj.returnType || opts.returnType || globalLinkOptsDefaults.returnType,
                } as ProcessedLinkOpts;
            }
        }
    }

    if (requestedProperties.length === 0) {
        throw new TypeError("Props array must contain at least one predicate");
    }

    const returnType = opts.returnType || "term";

    return function wrapWithConnect(wrappedComponent: React.ComponentType<any>): ComponentType<any> {
        class Link extends React.Component<any> {

            public static displayName = `Link(${wrappedComponent.name})`;
            // public static propTypes = {
            //     subject: subjectType,
            //     linkVersion: ReactPropTypes.string,
            // };

            public render() {
                const props = this
                    .props
                    .lrs
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
                const acc: PropertyBoundProps = {};
                const { lrs } = this.props;

                for (const propOpts of Object.values(propMap)) {
                    propOpts.label.forEach((cur) => {
                        if (acc[propOpts.name]) {
                            // TODO: Merge
                            return;
                        }

                        if (propOpts.limit === 1) {
                            const p = getPropBestLangRaw(
                                lrs.getResourcePropertyRaw(this.props.subject, cur),
                                lrs.store.langPrefs,
                            );
                            if (p) {
                                acc[propOpts.name] = toReturnType(returnType, p);
                            }
                        } else {
                            acc[propOpts.name] = props
                                .filter((s: Statement) => s.predicate.sI === cur.sI)
                                .map(
                                    (s: Statement) => toReturnType(returnType, s),
                                ) as Statement[] | SomeTerm[] | string[];
                        }

                        return acc;
                    });
                }

                return acc;
            }
        }

        return withLinkCtx(Link);
    };
}
