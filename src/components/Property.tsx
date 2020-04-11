import { SomeTerm, TermType } from "@ontologies/core";
import rdf from "@ontologies/rdf";
import { SomeNode } from "link-lib";
import React from "react";

import { useLRS } from "../hooks/useLRS";

import {
  DataInvalidationProps,
  LabelType,
  LinkCtxOverrides,
  LinkedPropType,
  SubjectProp,
  TopologyProp,
} from "../types";

import { getLinkedObjectClass } from "./Property/getLinkedObjectClass";
import { createLimitTimes } from "./Property/limitTimes";
import { renderChildrenOrValue } from "./Property/renderChildrenOrValue";
import { useChildPropsOrFallback } from "./Property/useChildPropsOrFallback";
import { Resource } from "./Resource";

export interface PropertyPropTypes extends Partial<DataInvalidationProps>, Partial<TopologyProp> {
    children?: React.ReactNode;

    /**
     * Pass `true` if the property should render if no data is found.
     * Useful for nesting property's to enable multi-property logic.
     */
    forceRender?: boolean;
    /**
     * The property of the surrounding subject to render.
     * @see Resource#subject
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

export const Property: React.ComponentType<PropertyPropTypes & any> = (props): React.ReactElement<any> | null => {
    const lrs = useLRS();
    const childPropsOrFallback = useChildPropsOrFallback(props);

    if (childPropsOrFallback === null || !Array.isArray(childPropsOrFallback)) {
      return childPropsOrFallback;
    }

    const [childProps, objRaw] = childPropsOrFallback;

    const associationRenderer = getLinkedObjectClass(
        childProps,
        lrs,
        rdf.predicate,
    ) || React.Fragment;
    const associationProps = associationRenderer !== React.Fragment ? childProps : null;
    const childComp = typeof childProps.children === "function"
      ? childProps.children(objRaw)
      : childProps.children;
    if (typeof childProps.children === "function") {
        return React.createElement(associationRenderer, associationProps, childComp);
    }

    const limitTimes = createLimitTimes(childProps, objRaw, lrs);

    const component = getLinkedObjectClass(childProps, lrs);
    if (component) {
        const toRender = limitTimes(
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

                return <Resource {...lrcProps}>{childComp}</Resource>;
            };

            return limitTimes(wrapLOC, associationRenderer);
        }

        return limitTimes(
            renderChildrenOrValue(childProps, lrs),
            associationRenderer,
        );
    }
    if (childProps.children) {
        return React.createElement(associationRenderer, associationProps, childComp);
    }

    return null;
};

Property.defaultProps = {
    forceRender: false,
    limit: 1,
    linkedProp: undefined,
};
Property.displayName = "Property";

export { getLinkedObjectClass } from "./Property/getLinkedObjectClass";
