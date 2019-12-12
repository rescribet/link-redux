import rdfFactory, { NamedNode, SomeTerm, TermType } from "@ontologies/core";
import rdf from "@ontologies/rdf";
import rdfs from "@ontologies/rdfs";
import {
    getTermBestLang,
    normalizeType,
    SomeNode,
} from "link-lib";
import React from "react";

import { useCalculateChildProps, useLinkRenderContext } from "../hocs/withLinkCtx";
import { useDataInvalidation } from "../hooks/useDataInvalidation";
import { useLRS } from "../hooks/useLRS";

import {
    DataInvalidationProps,
    LabelType,
    LinkCtxOverrides,
    LinkedPropType,
    LinkReduxLRSType,
    SubjectProp,
    TopologyProp,
} from "../types";

import { LinkedResourceContainer as LRC } from "./LinkedResourceContainer";
import { renderError } from "./Typable";

export interface PropertyPropTypes extends Partial<DataInvalidationProps>, Partial<TopologyProp> {
    children?: React.ReactNode;

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

export type PropertyWrappedProps = PropertyPropTypes
    & Partial<LinkCtxOverrides> & Required<SubjectProp>;

const nodeTypes: string[] = [TermType.NamedNode, TermType.BlankNode];

export function getLinkedObjectClass({ label, subject, topology, topologyCtx }: PropertyWrappedProps,
                                     lrs: LinkReduxLRSType,
                                     labelOverride?: NamedNode): React.ComponentType | undefined {
    return lrs.resourcePropertyComponent(
        subject,
        labelOverride || label,
        topology === null ? undefined : topology || topologyCtx,
    );
}

function limitTimes<P extends PropertyWrappedProps>(
    props: P,
    objRaw: SomeTerm[],
    lrs: LinkReduxLRSType,
    func: (prop: SomeTerm) => React.ReactNode,
    associationRenderer: React.ComponentType<P>,
): React.ReactElement<P> | null {

    const associationProps = associationRenderer !== React.Fragment ? props : null;

    if (objRaw.length === 0) {
        return null;
    } else if (objRaw.length === 1) {
        return React.createElement(associationRenderer, associationProps, func(objRaw[0]));
    } else if (props.limit === 1) {
        return React.createElement(
            associationRenderer,
            associationProps,
            // @ts-ignore
            func(getTermBestLang(objRaw, lrs.store.langPrefs)),
        );
    }
    const pLimit = Math.min(...[props.limit, objRaw.length].filter(Number) as number[]);
    const elems = new Array(pLimit);
    for (let i = 0; i < pLimit; i++) {
        elems.push(func(objRaw[i]));
    }

    return React.createElement(associationRenderer, associationProps, elems);
}

function renderChildrenOrValue(props: PropertyWrappedProps, lrs: LinkReduxLRSType):
    (p: SomeTerm) => React.ReactNode {

    return function(p: SomeTerm): React.ReactNode {
        if (props.children || p.termType !== TermType.Literal) {
            return React.createElement(React.Fragment, null, props.children || p.value);
        }

        const { topology, topologyCtx, subjectCtx } = props;
        const literalRenderer = lrs.getComponentForProperty(
          rdfs.Literal,
            rdfFactory.namedNode(p.datatype.value),
            topology === null ? undefined : topology || topologyCtx,
        );

        if (!literalRenderer) {
            return React.createElement(React.Fragment, null, p.value);
        }

        return React.createElement(
            literalRenderer,
            {
                linkedProp: p,
                subject: p.datatype,
                subjectCtx,
                topology,
                topologyCtx,
            },
        );
    };
}

export function Prop(props: PropertyPropTypes & any): React.ReactElement<any> | null {
    const options = { topology: true };

    const lrs = useLRS();
    const [error, setError] = React.useState<Error|undefined>(undefined);
    const context = useLinkRenderContext();
    const subjectData = lrs.tryEntity(context.subject);

    const childProps = useCalculateChildProps(props, context, options);
    try {
        useDataInvalidation(childProps);
    } catch (e) {
        setError(e);
    }
    if (subjectData.length === 0) {
        return null;
    }
    const labels = normalizeType(childProps.label).map((l) => l.value);
    const objRaw = subjectData
        .filter((s) => labels.includes(s.predicate.value))
        .map((s) => s.object);

    if (error) {
        return renderError(childProps, lrs, error);
    }

    if (objRaw.length === 0 && !childProps.forceRender) {
        return null;
    }

    const associationRenderer = getLinkedObjectClass(
        childProps,
        lrs,
        rdf.predicate,
    ) || React.Fragment;
    const associationProps = associationRenderer !== React.Fragment ? childProps : null;
    const childComp = typeof childProps.children === "function" ? childProps.children(objRaw) : childProps.children;
    if (typeof childProps.children === "function") {
        return React.createElement(associationRenderer, associationProps, childComp);
    }

    const component = getLinkedObjectClass(childProps, lrs);
    if (component) {
        const toRender = limitTimes(
            childProps,
            objRaw,
            lrs,
            (p) => React.createElement(component, { ...childProps, linkedProp: p }, childComp),
            associationRenderer,
        );
        if (toRender === null) {
            return React.createElement(
                associationRenderer,
                associationProps,
                React.createElement(component, { ...childProps }, childComp),
            );
        }

        return toRender;
    } else if (objRaw.length > 0) {
        if (nodeTypes.includes(objRaw[0].termType)) {
            const wrapLOC = (p: SomeTerm | undefined) => {
                const lrcProps = {
                    ...childProps,
                    subject: p! as SomeNode,
                };

                // return React.createElement(LRC, lrcProps, childComp);
                return <LRC {...lrcProps}>{childComp}</LRC>;
            };

            return limitTimes(childProps, objRaw, lrs, wrapLOC, associationRenderer);
        }

        return limitTimes(
            childProps,
            objRaw,
            lrs,
            renderChildrenOrValue(childProps, lrs),
            associationRenderer,
        );
    }
    if (childProps.children) {
        return React.createElement(associationRenderer, associationProps, childComp);
    }

    return null;
}

Prop.defaultProps = {
    forceRender: false,
    limit: 1,
    linkedProp: undefined,
};
Prop.displayName = "Property";

export const Property = React.memo(Prop);
