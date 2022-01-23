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

    const t = lrs.getState(props.subject.value).current;

    if (t === RecordState.Absent || LOADING_STATES.includes(t)) {
        const loadComp = loadingComponent(props, lrs);

        return loadComp === null
            ? null
            : wrapRenderContext(props, React.createElement(loadComp, props));
    }

    const status = lrs.getStatus(props.subject);
    if (status.status! >= BAD_REQUEST) {
        return renderError(props, lrs, error);
    }

    return undefined;
}
