import { ReactElement } from "react";
import * as React from "react";
import { useDataFetching } from "../hooks/useDataFetching";
import { useDataInvalidation } from "../hooks/useDataInvalidation";

import {
    DataInvalidationProps,
    LinkContext,
} from "../types";

import {
    nextContext,
    renderLoadingOrError,
    renderNoView,
    TypableInjectedProps,
    TypableProps,
    wrapContext,
} from "./Typable";
import { calculateChildProps, useLinkContext } from "./withLinkCtx";

export interface PropTypes extends TypableProps {
    children?: React.ReactNode;
    fetch?: boolean;
    forceRender?: boolean;
}

export interface InjectedPropTypes extends PropTypes, DataInvalidationProps, TypableInjectedProps {}

function calculateView(props: InjectedPropTypes, context: LinkContext, error?: Error): ReactElement<any> | null {
    if (props.forceRender && props.children) {
        return React.createElement(React.Fragment, null, props.children);
    }

    const notReadyComponent = renderLoadingOrError(props, context, error);
    if (notReadyComponent !== undefined) {
        return notReadyComponent;
    }

    if (props.children) {
        return React.createElement(React.Fragment, null, props.children);
    }
    const component = context.lrs.resourceComponent(
        props.subject,
        props.topology || props.topologyCtx,
    );
    if (component !== undefined) {
        return React.createElement(component, props);
    }

    return renderNoView(props, context);
}

export function LRC(props: PropTypes, _?: any): ReactElement<any> | null {
    let context = useLinkContext();
    const [error, setError] = React.useState<Error|undefined>(undefined);

    const options = {
        helpers: {
            reset: () => setError(undefined),
        },
        subject: true,
        topology: true,
    };
    const childProps = calculateChildProps(props, context, options) as InjectedPropTypes;
    context = nextContext(childProps, context);
    const lastUpdate = useDataInvalidation(childProps, context);
    useDataFetching(childProps, context, lastUpdate, setError);

    const comp = calculateView(childProps, context, error);

    return wrapContext(childProps, context, comp);
}

LRC.defaultProps = {
    children: undefined,
    forceRender: false,
    onError: undefined,
    onLoad: undefined,
    topology: undefined,
};
LRC.displayName = "LinkedResourceContainer";

export const LinkedResourceContainer = React.memo(LRC);
