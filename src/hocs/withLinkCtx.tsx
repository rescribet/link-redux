import hoistNonReactStatics from "hoist-non-react-statics";
import { DEFAULT_TOPOLOGY } from "link-lib";
import { NamedNode } from "rdflib";
import * as React from "react";

import { useLRS } from "../hooks/useLRS";
import {
    Helpers,
    LinkCtxOverrides,
    LinkedRenderStoreContext,
    LinkRenderContext,
    PropsWithOptLinkProps,
    SubjectProp,
    TopologyProp,
} from "../types";

export interface WithLinkCtxOptions {
    [k: string]: boolean | object | undefined;
    helpers?: Helpers;
}

export const LinkRenderCtx = React.createContext<LinkRenderContext>(
    {
        subject: undefined!,
        topology: DEFAULT_TOPOLOGY,
    },
);

export const useLinkRenderContext = () => React.useContext(LinkRenderCtx);

export const { Consumer, Provider } = LinkRenderCtx;

export function useCalculateChildProps<P>(props: P & Partial<SubjectProp & TopologyProp>,
                                          context: LinkRenderContext,
                                          options: WithLinkCtxOptions = {}):
    P & Partial<LinkRenderContext & LinkedRenderStoreContext> & Partial<LinkCtxOverrides> {

    const lrs = useLRS();
    const { subject, topology } = context;
    const overrides: Partial<LinkRenderContext & LinkedRenderStoreContext & LinkCtxOverrides> = {};

    if (options.subject) {
        overrides.subjectCtx = subject;
        overrides.subject = props.subject;
    }
    if (options.topology) {
        overrides.topologyCtx = topology;
        overrides.topology = props.topology === null ? DEFAULT_TOPOLOGY : props.topology;
    }
    if (options.lrs) {
        overrides.lrs = lrs;
    }
    if (options.helpers) {
        overrides.reset = options.helpers.reset;
        overrides.reloadLinkedObject = () =>
            lrs.getEntity((props.subject || subject) as NamedNode, { reload: true });
    }

    return Object.assign(
        {},
        props,
        { subject, topology: topology! },
        overrides,
    );
}

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
