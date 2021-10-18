import { RENDER_CLASS_NAME, RequestStatus } from "link-lib";
import React from "react";

import { LinkRenderCtx } from "../contexts/LinkRenderCtx";
import ll from "../ontology/ll";
import {
    DataInvalidationProps,
    LabelType,
    LinkCtxOverrides,
    LinkReduxLRSType,
    LinkRenderContext,
    SubjectProp,
    TopologyProp,
} from "../types";

export interface TypableProps extends DataInvalidationProps {
    linkVersion?: number;
    onError?: React.ComponentType;
    onLoad?: React.ComponentType;
}

export interface TypableInjectedProps extends SubjectProp, Partial<TopologyProp>, Partial<LinkCtxOverrides>  {}

export function nextRenderContext(props: TypableInjectedProps): LinkRenderContext {
    return {
        subject: props.subject,
        topology: props.topology || props.topologyCtx,
    };
}

export function wrapRenderContext(props: TypableInjectedProps,
                                  comp: React.ReactNode) {
    return React.createElement(
        LinkRenderCtx.Provider,
        { value: nextRenderContext(props) },
        comp,
    );
}

export function renderNoView(props: TypableInjectedProps & { label?: LabelType }, lrs: LinkReduxLRSType) {
    const NoView = lrs.getComponentForProperty(
        ll.NoView,
        (props.label || RENDER_CLASS_NAME),
        props.topology || props.topologyCtx,
    );

    const message = `No view found for subject '${props.subject}' label '${props.label}' and topology ${props.topology || props.topologyCtx}`;
    lrs.report(new Error(message));

    if (NoView) {
        return React.createElement(NoView);
    }

    return React.createElement(
        "div",
        { "className": "no-view", "data-testid": "no-view" },
        React.createElement("p", null, message),
    );
}

export function renderError(props: Partial<TypableProps> & DataInvalidationProps & TypableInjectedProps,
                            lrs: LinkReduxLRSType,
                            error?: Error | RequestStatus) {
    const errComp = errorComponent(props, lrs);
    if (errComp) {
        return wrapRenderContext(
            props,
            React.createElement(
                errComp,
                Object.assign(
                    {},
                    props,
                    {
                        error: error instanceof Error ? error : undefined,
                        linkRequestStatus: lrs.getStatus(props.subject || props.subjectCtx),
                        report: lrs.report,
                        subject: props.subject,
                    },
                ),
            ),
        );
    }

    return null;
}

export function errorComponent(props: TypableProps & TypableInjectedProps, lrs: LinkReduxLRSType) {
    return (props.onError as any)
        || lrs.getComponentForType(ll.ErrorResource, props.topology || props.topologyCtx)
        || null;
}

export function loadingComponent(props: TypableProps & TypableInjectedProps, lrs: LinkReduxLRSType) {
    return (props.onLoad as any)
        || lrs.getComponentForType(ll.LoadingResource, props.topology || props.topologyCtx)
        || null;
}
