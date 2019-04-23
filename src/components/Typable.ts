import { ACCEPTED, BAD_REQUEST } from "http-status-codes";
import {
    defaultNS as NS, RequestStatus,
} from "link-lib";
import { ReactElement } from "react";
import * as React from "react";

import {
    DataInvalidationProps,
    LinkContext,
    LinkCtxOverrides,
    SubjectProp,
    SubjectType,
    TopologyProp,
} from "../types";
import { Provider } from "./withLinkCtx";

export interface TypableProps extends DataInvalidationProps {
    linkVersion?: number;
    onError?: React.ReactType;
    onLoad?: React.ReactType;
}

export interface TypableInjectedProps extends SubjectProp, TopologyProp, Partial<LinkCtxOverrides>  {}

export function nextContext(props: TypableInjectedProps, context: LinkContext): LinkContext {
    return {
        lrs: context.lrs,
        subject: props.subject,
        topology: props.topology || props.topologyCtx,
    };
}

export function wrapContext<P>(props: P & TypableInjectedProps,
                               nextCtx: LinkContext,
                               comp: React.ReactNode) {
    return React.createElement(
        Provider,
        { value: nextContext(props, nextCtx) },
        comp,
    );
}

export function renderNoView(props: TypableInjectedProps, context: LinkContext) {
    // tslint:disable-next-line no-console
    console.log(
        "no-view",
        props.subject,
        context.lrs.getStatus(props.subject),
    );

    return React.createElement(
        "div",
        { className: "no-view" },
        React.createElement("p", null, `We currently don't have a view for this (${props.subject})`),
    );
}

export function renderError(props: Partial<TypableProps> & DataInvalidationProps & TypableInjectedProps,
                            context: LinkContext,
                            error?: Error | RequestStatus) {
    const errComp = errorComponent(props, context);
    if (errComp) {
        return wrapContext(
            props,
            context,
            React.createElement(
                errComp,
                Object.assign(
                    {},
                    props,
                    {
                        error: error instanceof Error ? error : undefined,
                        linkRequestStatus: context.lrs.getStatus(props.subject || props.subjectCtx),
                        report: context.lrs.report,
                        subject: props.subject,
                    },
                ),
            ),
        );
    }

    return null;
}

export function renderLoadingOrError(props: TypableProps & TypableInjectedProps,
                                     context: LinkContext,
                                     error?: Error): ReactElement<any> | null | undefined {

    if (error) {
        return renderError(props, context, error);
    }

    const status = context.lrs.getStatus(props.subject);
    if (status.status === ACCEPTED || context.lrs.shouldLoadResource(props.subject)) {
        const loadComp = loadingComponent(props, context);

        return loadComp === null
            ? null
            : wrapContext(props, context, React.createElement(loadComp, props));
    }

    if (status.status! >= BAD_REQUEST) {
        return renderError(props, context, error);
    }

    return undefined;
}

export function errorComponent(props: TypableProps & TypableInjectedProps, context: LinkContext) {
    return (props.onError as any)
        || context.lrs.getComponentForType(NS.ll("ErrorResource"), props.topology || props.topologyCtx)
        || null;
}

export function loadingComponent(props: TypableProps & TypableInjectedProps, context: LinkContext) {
    return (props.onLoad as any)
        || context.lrs.getComponentForType(NS.ll("LoadingResource"), props.topology || props.topologyCtx)
        || null;
}
