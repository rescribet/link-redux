import { RENDER_CLASS_NAME } from "link-lib";
import { NamedNode } from "rdflib";
import { ReactElement } from "react";
import * as React from "react";
import { createElement } from "react";

import {
    useCalculateChildProps,
    useLinkRenderContext,
} from "../hocs/withLinkCtx";
import { useDataInvalidation } from "../hooks/useDataInvalidation";
import { useRenderLoadingOrError } from "../hooks/useLoadingOrError";
import { useLRS } from "../hooks/useLRS";

import {
    renderNoView,
    TypableInjectedProps,
    TypableProps,
} from "./Typable";

export interface PropTypes extends TypableProps {
    children?: React.ReactType;
    label?: NamedNode;
}

export interface PropTypesWithInjected extends PropTypes, TypableInjectedProps {}

export function Type(props: PropTypes, _?: any): ReactElement<any> | null {
    const options = {};
    const lrs = useLRS();
    const context = useLinkRenderContext();
    const childProps = useCalculateChildProps(props, context, options) as PropTypesWithInjected;
    useDataInvalidation(childProps);

    const notReadyComponent = useRenderLoadingOrError(childProps);
    if (notReadyComponent !== undefined) {
        return notReadyComponent;
    }

    const component = lrs.resourcePropertyComponent(
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

    return renderNoView(childProps, lrs);
}
