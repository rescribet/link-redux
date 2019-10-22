import { defaultNS as NS, RENDER_CLASS_NAME, RequestStatus } from "link-lib";
import * as React from "react";

import { Provider } from "../hocs/withLinkCtx";
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
    onError?: React.ReactType;
    onLoad?: React.ReactType;
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
        Provider,
        { value: nextRenderContext(props) },
        comp,
    );
}

export function renderNoView(props: TypableInjectedProps & { label?: LabelType }, lrs: LinkReduxLRSType) {
    const NoView = lrs.getComponentForProperty(
        NS.ll("NoView"),
        (props.label || RENDER_CLASS_NAME),
        props.topology || props.topologyCtx,
    );

    if (NoView) {
        return React.createElement(NoView);
    }

    // tslint:disable-next-line no-console
    console.log(
        "no-view",
        props.subject,
        lrs.getStatus(props.subject),
    );

    return React.createElement(
        "div",
        { className: "no-view" },
        React.createElement("p", null, `We currently don't have a view for this (${props.subject})`),
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
        || lrs.getComponentForType(NS.ll("ErrorResource"), props.topology || props.topologyCtx)
        || null;
}

export function loadingComponent(props: TypableProps & TypableInjectedProps, lrs: LinkReduxLRSType) {
    return (props.onLoad as any)
        || lrs.getComponentForType(NS.ll("LoadingResource"), props.topology || props.topologyCtx)
        || null;
}
