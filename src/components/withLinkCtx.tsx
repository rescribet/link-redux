import { DEFAULT_TOPOLOGY } from "link-lib";
import { NamedNode } from "rdflib";
import * as React from "react";

import {
    LinkContext,
    LinkCtxOverrides,
    LinkedRenderStoreContext,
    LinkReduxLRSType,
    PropsWithOptLinkProps,
    SubjectProp,
    TopologyProp,
} from "../types";

export interface WithLinkCtxOptions {
    [k: string]: boolean;
}

export const { Consumer, Provider } = React.createContext<Partial<LinkContext> & LinkedRenderStoreContext>(
    { lrs: {} as LinkReduxLRSType },
);

function calculateChildProps<P>(props: P & Partial<SubjectProp & TopologyProp>,
                                context: Partial<LinkContext> & LinkedRenderStoreContext,
                                options: WithLinkCtxOptions): P & LinkContext & Partial<LinkCtxOverrides> {

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

    return Object.assign(
        {},
        props,
        { lrs, subject: subject!, topology },
        overrides,
    );
}

export function withLinkCtx<P>(
    Component: React.ComponentType<P & LinkContext & Partial<LinkCtxOverrides>>,
    options: WithLinkCtxOptions = {}): React.ComponentType<PropsWithOptLinkProps<P>> {

    const Comp: React.FunctionComponent<PropsWithOptLinkProps<P>> = (props: PropsWithOptLinkProps<P>) => (
        <Consumer>
            {(context: Partial<LinkContext> & LinkedRenderStoreContext) => {
                const childProps = calculateChildProps(props, context, options);

                return <Component {...childProps as P & LinkContext & Partial<LinkCtxOverrides>} />;
            }}
        </Consumer>
    );
    Comp.displayName = "withLinkCtxWrapper";

    return Comp;
}
