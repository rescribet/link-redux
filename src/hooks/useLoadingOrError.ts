import { ACCEPTED, BAD_REQUEST } from "http-status-codes";
import { default as React, ReactElement } from "react";
import {
    loadingComponent,
    renderError,
    TypableInjectedProps,
    TypableProps,
    wrapRenderContext,
} from "../components/Typable";

import { useLRS } from "./useLRS";

export function useRenderLoadingOrError(props: TypableProps & TypableInjectedProps,
                                        error?: Error): ReactElement<any> | null | undefined {

    const lrs = useLRS();

    if (error) {
        return renderError(props, lrs, error);
    }

    const status = lrs.getStatus(props.subject);
    if (status.status === ACCEPTED || lrs.shouldLoadResource(props.subject)) {
        const loadComp = loadingComponent(props, lrs);

        return loadComp === null
            ? null
            : wrapRenderContext(props, React.createElement(loadComp, props));
    }

    if (status.status! >= BAD_REQUEST) {
        return renderError(props, lrs, error);
    }

    return undefined;
}
