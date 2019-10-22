import { ReactElement } from "react";
import * as React from "react";

import { useCalculateChildProps, useLinkRenderContext } from "../hocs/withLinkCtx";
import { useDataFetching } from "../hooks/useDataFetching";
import { useDataInvalidation } from "../hooks/useDataInvalidation";
import { useRenderLoadingOrError } from "../hooks/useLoadingOrError";
import { useLRS } from "../hooks/useLRS";
import {
  DataInvalidationProps,
  LinkReduxLRSType,
} from "../types";

import {
    renderNoView,
    TypableInjectedProps,
    TypableProps,
    wrapRenderContext,
} from "./Typable";

export interface LRCPropTypes<R = any> extends TypableProps {
    children?: React.ReactNode;
    fetch?: boolean;
    forceRender?: boolean;
    innerRef?: React.Ref<R>;
}

export interface InjectedPropTypes extends LRCPropTypes, DataInvalidationProps, TypableInjectedProps {}

function useCalculatedViewWithState(props: InjectedPropTypes,
                                    lrs: LinkReduxLRSType,
                                    error?: Error): ReactElement<any> | null {

    if (props.forceRender && props.children) {
        return React.createElement(React.Fragment, null, props.children);
    }

    const notReadyComponent = useRenderLoadingOrError(props, error);
    if (notReadyComponent !== undefined) {
        return notReadyComponent;
    }

    if (props.children) {
        return React.createElement(React.Fragment, null, props.children);
    }
    const component = lrs.resourceComponent(
        props.subject,
        props.topology || props.topologyCtx,
    );
    if (component !== undefined) {
        return React.createElement(component, props);
    }

    return renderNoView(props, lrs);
}

export function LRC<P, R>(props: LRCPropTypes<R> & P, _?: any): ReactElement | null {
    const context = useLinkRenderContext();
    const [error, setError] = React.useState<Error|undefined>(undefined);

    const options = {
        helpers: {
            reset: () => setError(undefined),
        },
        subject: true,
        topology: true,
    };
    const lrs = useLRS();
    const childProps = useCalculateChildProps<P>(props, context, options);
    const lastUpdate = useDataInvalidation(childProps);
    useDataFetching(childProps, lastUpdate, setError);

    const comp = useCalculatedViewWithState(childProps, lrs, error);

    return wrapRenderContext(childProps, comp);
}

LRC.defaultProps = {
    children: undefined,
    forceRender: false,
    onError: undefined,
    onLoad: undefined,
    topology: undefined,
};
LRC.displayName = "LinkedResourceContainer";

export const LinkedResourceContainer = React.forwardRef(
  (props: any, ref) => <LRC innerRef={ref} {...props} />,
);
