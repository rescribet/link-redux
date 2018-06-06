import { defaultNS, getTermBestLang, SomeNode } from "link-lib";
import { Requireable } from "prop-types";
import { NamedNode, SomeTerm } from "rdflib";
import * as React from "react";

import { lrsType, topologyType } from "../../propTypes";
import {
    LinkedResourceContainer as LRC,
    PropTypes as LRSPropTypes,
} from "../../redux/LinkedResourceContainer";
import { linkedSubject } from "../../redux/linkedSubject";
import { linkedVersion } from "../../redux/linkedVersion";
import {
    LabelType,
    LinkedPropType,
    LinkReduxLRSType,
    PropertyProps,
    SubjectProp,
    TopologyType,
} from "../../types";

export interface PropertyPropTypes extends PropertyProps {
    /**
     * Pass `true` if the property should render if no data is found.
     * Useful for nesting property's to enable multi-property logic.
     */
    forceRender?: boolean;
    /**
     * The property of the surrounding subject to render.
     * @see LinkedResourceContainer#subject
     */
    label: LabelType;
    /**
     * Controls the amount of resources to be displayed. This must be greater than 0.
     * Pass `Infinity` to render all the items.
     */
    limit?: number;
    /** Internal property used for speeding up some types of renders. */
    linkedProp?: LinkedPropType;
}

export interface ContextTypes {
    linkedRenderStore: LinkReduxLRSType;
    topology: TopologyType;
}

const nodeTypes = ["NamedNode", "BlankNode"];

export function getLinkedObjectClass(props: PropertyPropTypes,
                                     { linkedRenderStore, topology }: ContextTypes,
                                     label?: NamedNode): React.ReactType | undefined {
    return linkedRenderStore.resourcePropertyComponent(
        props.subject,
        label || props.label,
        topology === null ? undefined : topology,
    );
}

export class PropertyComp extends React.PureComponent<PropertyPropTypes> {
    public static contextTypes = {
        linkedRenderStore: lrsType,
        topology: topologyType,
    };
    public static defaultProps = {
        forceRender: false,
        limit: 1,
        linkedProp: undefined,
    };
    public static displayName = "Property";

    public render() {
        const { forceRender } = this.props;
        const objRaw = this.context.linkedRenderStore.getResourceProperties(
            this.props.subject,
            this.props.label,
        );

        if (objRaw.length === 0 && !forceRender) {
            return null;
        }

        const associationRenderer = getLinkedObjectClass(
            this.props,
            this.context,
            defaultNS.rdf("predicate"),
        ) || React.Fragment;
        const associationProps = associationRenderer !== React.Fragment ? this.props : null;
        const component = getLinkedObjectClass(this.props, this.context);
        if (component) {
            const toRender = this.limitTimes(
                objRaw,
                (p) => React.createElement(component, { ...this.props, linkedProp: p }, this.props.children),
                associationRenderer,
            );
            if (toRender === null) {
                return React.createElement(
                    associationRenderer,
                    associationProps,
                    React.createElement(component, { ...this.props }, this.props.children),
                );
            }

            return toRender;
        } else if (objRaw.length > 0) {
            if (nodeTypes.includes(objRaw[0].termType)) {
                const wrapLOC = (p: SomeTerm | undefined) => {
                    const lrcProps = { ...this.props, subject: p! as SomeNode };

                    return React.createElement(LRC, lrcProps, this.props.children);
                };

                return this.limitTimes(objRaw, wrapLOC, associationRenderer);
            }

            return this.limitTimes(
                objRaw,
                (p) => React.createElement(React.Fragment, null, this.props.children || p.value),
                associationRenderer,
            );
        }
        if (this.props.children) {
            return React.createElement(associationRenderer, associationProps, this.props.children);
        }

        return null;
    }

    private limitTimes(
        objRaw: SomeTerm[],
        func: (prop: SomeTerm) => React.ReactElement<any>,
        associationRenderer: React.ReactType,
    ): React.ReactElement<any> | Array<React.ReactElement<any>> | null {

        const associationProps = associationRenderer !== React.Fragment ? this.props : null;

        if (objRaw.length === 0) {
            return null;
        } else if (objRaw.length === 1) {
            return React.createElement(associationRenderer, associationProps, func(objRaw[0]));
        } else if (this.props.limit === 1) {
            return React.createElement(
                associationRenderer,
                associationProps,
                func(getTermBestLang(objRaw, this.context.linkedRenderStore.store.langPrefs)),
            );
        }
        const pLimit = Math.min(...[this.props.limit, objRaw.length].filter(Number) as number[]);
        const elems = new Array(pLimit);
        for (let i = 0; i < pLimit; i++) {
            elems.push(func(objRaw[i]));
        }

        return React.createElement(associationRenderer, associationProps, elems);
    }
}

const connectedProp = linkedVersion(PropertyComp);
connectedProp.displayName = "ConnectedProp";

// tslint:disable-next-line: variable-name
export const Property = linkedSubject(connectedProp);
