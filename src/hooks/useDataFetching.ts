import { NamedNode, TermType } from "@ontologies/core";
import React from "react";

import { ResourcePropTypes } from "../components/Resource";
import { id } from "../factoryHelpers";

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
export function useDataFetching(props: ResourcePropTypes,
                                lastUpdate?: number,
                                setError?: (e: Error) => void) {
    const lrs = useLRS();

    React.useEffect(
        () => {
            if (props.subject && lrs.shouldLoadResource(props.subject)) {
                if (setError && props.subject.termType === TermType.BlankNode) {
                    return setError(new TypeError(blankNodeWarn));
                }
                if (!!props.fetch || true) {
                    lrs.queueEntity((props.subject as NamedNode));
                }
            }
        },
        [id(props.subject), lastUpdate],
    );
}
