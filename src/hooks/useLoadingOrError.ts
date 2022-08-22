import { BAD_REQUEST } from "http-status-codes";
import { RecordState } from "link-lib";
import React from "react";
import {
    loadingComponent,
    renderError,
    TypableInjectedProps,
    TypableProps,
    wrapRenderContext,
} from "../components/Typable";

import { useLRS } from "./useLRS";

const LOADING_STATES = [
    RecordState.Queued,
    RecordState.Requested,
    RecordState.Receiving,
];

export function useRenderLoadingOrError(
  props: TypableProps & TypableInjectedProps,
  error?: Error,
): React.ReactElement<any> | null | undefined {
    const lrs = useLRS();

    if (error) {
        return renderError(props, lrs, error);
    }

    const { current, previous } = lrs.getState(props.subject.value);
    const status = lrs.getStatus(props.subject);
    const hasError = status.status! >= BAD_REQUEST;

    if (previous === RecordState.Present && current !== RecordState.Absent && !hasError) {
        return undefined;
    }

    if (current === RecordState.Absent || LOADING_STATES.includes(current)) {
        const loadComp = loadingComponent(props, lrs);

        return loadComp === null
            ? null
            : wrapRenderContext(props, React.createElement(loadComp, props));
    }

    if (hasError) {
        return renderError(props, lrs, error);
    }

    return undefined;
}
