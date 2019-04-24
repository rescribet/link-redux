import { NamedNode } from "rdflib";
import * as React from "react";

import { PropTypes } from "../components/LinkedResourceContainer";

import { useLRS } from "./useLRS";

const blankNodeWarn = "Cannot load a blank node since it has no defined way to be resolved.";

/**
 * Fetches the {props.subject} if it has no data or is expired.
 *
 * @param lastUpdate The resource update time from {useDataInvalidation}, .
 * @param setError Is called when trying to load blank nodes, otherwise the request will fail.
 *
 * @see {LinkedRenderStore#shouldLoadResource} for the triggering mechanism.
 */
export function useDataFetching(props: PropTypes,
                                lastUpdate?: number,
                                setError?: (e: Error) => void) {
    const lrs = useLRS();

    React.useEffect(
        () => {
            if (props.subject && lrs.shouldLoadResource(props.subject)) {
                if (setError && props.subject.termType === "BlankNode") {
                    return setError(new TypeError(blankNodeWarn));
                }
                if (!!props.fetch || true) {
                    lrs.queueEntity((props.subject as NamedNode));
                }
            }
        },
        [props.subject, lastUpdate],
    );
}
