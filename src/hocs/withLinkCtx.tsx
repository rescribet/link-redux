import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";

import { useCalculateChildProps } from "../hooks/useCalculateChildProps";
import { useLinkRenderContext } from "../hooks/useLinkRenderContext";

import {
    Helpers,
    LinkCtxOverrides,
    LinkedRenderStoreContext,
    LinkRenderContext,
    PropsWithOptLinkProps,
} from "../types";

export interface WithLinkCtxOptions {
    [k: string]: boolean | object | undefined;
    helpers?: Helpers;
}

/** @deprecated Use `useLinkRenderContext` instead. */
export function withLinkCtx<P>(
    Component: React.ComponentType<P & LinkRenderContext & Partial<LinkCtxOverrides>>,
    options: WithLinkCtxOptions = { lrs: true }): React.ComponentType<PropsWithOptLinkProps<P>> {

    const Comp: React.FunctionComponent<PropsWithOptLinkProps<P>> = (props: PropsWithOptLinkProps<P>) => {
        const context = useLinkRenderContext();
        const childProps = useCalculateChildProps(props, context, options);

        return React.createElement(
            Component,
            childProps as unknown as P & LinkRenderContext & LinkedRenderStoreContext & Partial<LinkCtxOverrides>,
        );
    };
    Comp.displayName = "withLinkCtxWrapper";

    return hoistNonReactStatics(Comp, Component);
}
