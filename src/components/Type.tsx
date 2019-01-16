import { RENDER_CLASS_NAME } from "link-lib";
import { NamedNode } from "rdflib";
import { ReactElement } from "react";
import * as React from "react";
import { createElement } from "react";
import { useDataInvalidation } from "../hooks/useDataInvalidation";

import {
    renderLoadingOrError,
    renderNoView,
    TypableInjectedProps,
    TypableProps,
} from "./Typable";
import {
    calculateChildProps,
    useLinkContext,
} from "./withLinkCtx";

export interface PropTypes extends TypableProps {
    children?: React.ReactType;
    label?: NamedNode;
}

export interface PropTypesWithInjected extends PropTypes, TypableInjectedProps {}

export function Type(props: PropTypes, _?: any): ReactElement<any> | null {
    const options = {};
    const context = useLinkContext();
    const childProps = calculateChildProps(props, context, options) as PropTypesWithInjected;
    useDataInvalidation(childProps, context);

    const notReadyComponent = renderLoadingOrError(childProps, context);
    if (notReadyComponent !== undefined) {
        return notReadyComponent;
    }

    const component = context.lrs.resourcePropertyComponent(
        childProps.subject,
        (childProps.label || RENDER_CLASS_NAME) as NamedNode,
        childProps.topology || childProps.topologyCtx,
    );
    if (component !== undefined) {
        const {
            children,
            ...rest // tslint:disable-line trailing-comma
        } = childProps as {} & PropTypesWithInjected;

        return createElement(
            component,
            rest,
            children,
        );
    }

    return renderNoView(childProps, context);
}
