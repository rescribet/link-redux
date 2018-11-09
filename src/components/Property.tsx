import {
    defaultNS,
    getTermBestLang,
    SomeNode,
} from "link-lib";
import { Requireable } from "prop-types";
import { NamedNode, SomeTerm, Term } from "rdflib";
import * as React from "react";
import { useDataInvalidation } from "../hooks/useDataInvalidation";

import {
    DataInvalidationProps,
    LabelType,
    LinkContext,
    LinkCtxOverrides,
    LinkedPropType,
} from "../types";

import { LinkedResourceContainerComp as LRC } from "./LinkedResourceContainer";
import { withLinkCtx } from "./withLinkCtx";

export interface PropertyPropTypes {
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

export interface PropertyWrappedProps extends PropertyPropTypes, DataInvalidationProps, LinkContext, LinkCtxOverrides {}

const nodeTypes = ["NamedNode", "BlankNode"];

export function getLinkedObjectClass({ label, lrs, subject, topology, topologyCtx }: PropertyWrappedProps,
                                     labelOverride?: NamedNode): React.ReactType | undefined {
    return lrs.resourcePropertyComponent(
        subject,
        labelOverride || label,
        topology === null ? undefined : topology || topologyCtx,
    );
}

export class PropertyComp extends React.PureComponent<PropertyWrappedProps> {
    public static defaultProps = {
        forceRender: false,
        limit: 1,
        linkedProp: undefined,
    };
    public static displayName = "Property";

    constructor(props: PropertyWrappedProps) {
        super(props);

        this.renderChildrenOrValue = this.renderChildrenOrValue.bind(this);
    }

    public render() {
        const { forceRender } = this.props;
        const objRaw = this.props.lrs.getResourceProperties(
            this.props.subject,
            this.props.label,
        );

        if (objRaw.length === 0 && !forceRender) {
            return null;
        }

        const associationRenderer = getLinkedObjectClass(
            this.props,
            defaultNS.rdf("predicate"),
        ) || React.Fragment;
        const associationProps = associationRenderer !== React.Fragment ? this.props : null;
        const component = getLinkedObjectClass(this.props);
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
                    const lrcProps = {
                        ...this.props,
                        subject: p! as SomeNode,
                    };

                    return React.createElement(LRC, lrcProps, this.props.children);
                };

                return this.limitTimes(objRaw, wrapLOC, associationRenderer);
            }

            return this.limitTimes(objRaw, this.renderChildrenOrValue, associationRenderer);
        }
        if (this.props.children) {
            return React.createElement(associationRenderer, associationProps, this.props.children);
        }

        return null;
    }

    private renderChildrenOrValue(p: SomeTerm): React.ReactElement<any> {
        if (this.props.children || p.termType !== "Literal") {
            return React.createElement(React.Fragment, null, this.props.children || p.value);
        }

        const { lrs, topology, topologyCtx, subjectCtx } = this.props;
        const literalRenderer = lrs.getComponentForProperty(
            defaultNS.rdfs("Literal"),
            Term.namedNodeByIRI(p.datatype.value),
            topology === null ? undefined : topology || topologyCtx,
        );

        if (!literalRenderer) {
            return React.createElement(React.Fragment, null, p.value);
        }

        return React.createElement(
            literalRenderer,
            {
                linkedProp: p,
                lrs,
                subject: p.datatype,
                subjectCtx,
                topology,
                topologyCtx,
            },
        );
    }

    private limitTimes<P>(
        objRaw: SomeTerm[],
        func: (prop: SomeTerm) => React.ReactElement<P>,
        associationRenderer: React.ReactType,
    ): React.ReactElement<P> | Array<React.ReactElement<P>> | null {

        const associationProps = associationRenderer !== React.Fragment ? this.props : null;

        if (objRaw.length === 0) {
            return null;
        } else if (objRaw.length === 1) {
            return React.createElement(associationRenderer, associationProps, func(objRaw[0]));
        } else if (this.props.limit === 1) {
            return React.createElement(
                associationRenderer,
                associationProps,
                // @ts-ignore
                func(getTermBestLang(objRaw, this.props.lrs.store.langPrefs)),
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

export function PropertySubbed<P>(props: P & PropertyWrappedProps) {
    const version = useDataInvalidation(props, props.lrs);

    return <PropertyComp {...props} linkVersion={version} />;
}

// tslint:disable-next-line: variable-name
export const Property = withLinkCtx(PropertySubbed, { topology: true });
