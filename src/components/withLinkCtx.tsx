import { DEFAULT_TOPOLOGY } from "link-lib";
import * as React from "react";
import { connect } from "react-redux";

import { linkedObjectVersionByIRI } from "../redux/selectors";
import {
    LinkContext,
    LinkContextReceiverProps,
    LinkCtxOverrides,
    LinkedRenderStoreContext,
    LinkReduxLRSType,
    LinkStateTree,
    PropsWithOptLinkProps,
    SubjectProp,
    TopologyProp,
    VersionProp,
} from "../types";

export interface WithLinkCtxOptions {
    [k: string]: boolean;
}

export const { Consumer, Provider } = React.createContext<Partial<LinkContext> & LinkedRenderStoreContext>(
    { lrs: {} as LinkReduxLRSType },
);

const VersionBase = connect((state: LinkStateTree, { subject }: SubjectProp): VersionProp => {
    if (typeof subject === "undefined" || subject === null) {
        throw new Error("[LV] A subject must be given");
    }

    return {
        linkVersion: linkedObjectVersionByIRI(state, subject),
    };
});

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
    Component: React.ComponentType<P & LinkContextReceiverProps & Partial<LinkCtxOverrides>>,
    options: WithLinkCtxOptions = {}): React.ComponentType<PropsWithOptLinkProps<P>> {

    // @ts-ignore
    const VersionComp = VersionBase(Component);

    return (props: PropsWithOptLinkProps<P>) => (
        <Consumer>
            {(context: Partial<LinkContext> & LinkedRenderStoreContext) => {
                const childProps = calculateChildProps(props, context, options);

                const FinalComponent = childProps.subject ? VersionComp : Component;

                return <FinalComponent linkVersion="" {...childProps} />;
            }}
        </Consumer>
    );
}
