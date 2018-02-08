import { NamedNode, SomeTerm, Statement } from "rdflib";
import * as React from "react";

import { PropertyBase } from "../react/components";
import { PropertyPropTypes } from "../react/components/Property";
import { VersionProp } from "../types";
import { linkedSubject } from "./linkedSubject";
import { linkedVersion } from "./linkedVersion";

export interface LinkOpts {
    returnType?: "term" | "statement" | "value";
}

export interface MapDataToPropsParamObject {
    [k: string]: NamedNode | NamedNode[] | PropertyPropTypes;
}

export interface PropertyBoundProps {
    [k: string]: Statement | SomeTerm | string | undefined;
}

export type MapDataToPropsParam = MapDataToPropsParamObject | NamedNode[];

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
                     opts: LinkOpts = {}): (p: React.ComponentType) => React.ReactType {

    if (!Array.isArray(mapDataToProps)) {
        throw new TypeError("The mapDataToProps argument must be an array");
    }
    const requestedProperties = Array.isArray(mapDataToProps) ? mapDataToProps : [];

    const returnType = opts.returnType || "term";

    return function wrapWithConnect(wrappedComponent: React.ComponentType<any>) {
        class Link<T extends VersionProp> extends PropertyBase<any> {

            public static displayName = `Link(${wrappedComponent.name})`;

            public render() {
                if (requestedProperties.length === 0) {
                    return React.createElement(wrappedComponent, this.props);
                }
                const props = this.context
                    .linkedRenderStore
                    .tryEntity(this.props.subject)
                    .filter((s: Statement) => requestedProperties.includes(s.predicate));
                if (this.props.forceRender !== true && props.length === 0) {
                    return null;
                }

                return React.createElement(
                    wrappedComponent,
                    { ...this.props, ...this.getLinkedObjectProperties(props) },
                );
            }

            private getLinkedObjectProperties(props: Statement[]): { [k: string]: SomeTerm | undefined } {
                if (requestedProperties.length === 0) {
                    return {};
                }

                return requestedProperties.reduce((acc: PropertyBoundProps, cur) => {
                    const p = props.find((s: Statement) => s.predicate.sI === cur.sI);
                    if (p) {
                        switch (returnType) {
                            case "value":
                                acc[cur.term] = p.object.value;
                                break;
                            case "term":
                                acc[cur.term] = p.object;
                                break;
                            case "statement":
                                acc[cur.term] = p;
                                break;
                        }
                    }

                    return acc;
                }, {});
            }
        }

        return linkedSubject(linkedVersion(Link as React.ComponentType<any>));
    };
}
