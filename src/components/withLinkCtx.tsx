import hoistNonReactStatics from "hoist-non-react-statics";
import { DEFAULT_TOPOLOGY } from "link-lib";
import { NamedNode } from "rdflib";
import * as React from "react";

import {
    Helpers,
    LinkContext,
    LinkCtxOverrides,
    LinkedRenderStoreContext,
    LinkReduxLRSType,
    PropsWithOptLinkProps,
    SubjectProp,
    TopologyProp,
} from "../types";

export interface WithLinkCtxOptions {
    [k: string]: boolean | object | undefined;
    helpers?: Helpers;
}

export const LinkCtx = React.createContext<LinkContext & LinkedRenderStoreContext>(
    {
        lrs: {} as LinkReduxLRSType,
        subject: undefined!,
        topology: DEFAULT_TOPOLOGY,
    },
);

export const useLinkContext = () => React.useContext(LinkCtx);

export const { Consumer, Provider } = LinkCtx;

export function calculateChildProps<P>(props: P & Partial<SubjectProp & TopologyProp>,
                                       context: LinkContext,
                                       options: WithLinkCtxOptions = {}):
    P & Partial<LinkContext> & Partial<LinkCtxOverrides> {

    const { lrs, subject, topology } = context;
    const overrides: Partial<LinkContext & LinkCtxOverrides> = {};

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
            lrs.getEntity((props.subject || subject) as NamedNode);
    }

    return Object.assign(
        {},
        props,
        { subject, topology: topology! },
        overrides,
    );
}

export function withLinkCtx<P>(
    Component: React.ComponentType<P & LinkContext & Partial<LinkCtxOverrides>>,
    options: WithLinkCtxOptions = { lrs: true }): React.ComponentType<PropsWithOptLinkProps<P>> {

    const Comp: React.FunctionComponent<PropsWithOptLinkProps<P>> = (props: PropsWithOptLinkProps<P>) => {
        const context = useLinkContext();
        const childProps = calculateChildProps(props, context, options);

        return React.createElement(Component, childProps as P & LinkContext & Partial<LinkCtxOverrides>);
    };
    Comp.displayName = "withLinkCtxWrapper";

    return hoistNonReactStatics(Comp, Component);
}
