import React from "react";

import { useCalculateChildProps } from "../hooks/useCalculateChildProps";
import { useDataFetching } from "../hooks/useDataFetching";
import { normalizeDataSubjects } from "../hooks/useDataInvalidation";
import { useLinkRenderContext } from "../hooks/useLinkRenderContext";
import { useRenderLoadingOrError } from "../hooks/useLoadingOrError";
import { useLRS } from "../hooks/useLRS";
import { useResourceView } from "../hooks/useResourceView";
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

export interface ResourcePropTypes<R = any> extends TypableProps {
    children?: React.ReactNode;
    fetch?: boolean;
    forceRender?: boolean;
    innerRef?: React.Ref<R>;
}

export interface InjectedPropTypes extends ResourcePropTypes, DataInvalidationProps, TypableInjectedProps {}

function useCalculatedViewWithState(
    props: InjectedPropTypes,
    lrs: LinkReduxLRSType,
    error?: Error,
): React.ReactElement | null {
    const notReadyComponent = useRenderLoadingOrError(props, error);
    const component = useResourceView(
      props.subject,
      props.topology || props.topologyCtx,
    );

    if ((props.forceRender && props.children) || (notReadyComponent === undefined && props.children)) {
        return React.createElement(React.Fragment, null, props.children);
    }

    if (notReadyComponent !== undefined) {
        return notReadyComponent;
    }

    if (component !== undefined && component != null) {
        return React.createElement(component, props);
    }

    return renderNoView(props, lrs);
}

export function LRC<P, R>(props: ResourcePropTypes<R> & P, _?: any): React.ReactElement | null {
    const context = useLinkRenderContext();
    const [error, setError] = React.useState<Error|undefined>(undefined);
    const reset = React.useCallback(() => setError(undefined), [setError]);

    const options = {
        helpers: {
            reset,
        },
        subject: true,
        topology: true,
    };
    const lrs = useLRS();
    const childProps = useCalculateChildProps<P>(props, context, options);
    useDataFetching(normalizeDataSubjects(childProps), setError);

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
LRC.displayName = "Resource";

export const Resource = React.forwardRef(
  (props: any, ref) => <LRC innerRef={ref} {...props} />,
);
