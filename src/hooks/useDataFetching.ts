import { NamedNode } from "rdflib";
import * as React from "react";

import { PropTypes } from "../components/LinkedResourceContainer";

import { LinkContext } from "../types";

const blankNodeWarn = "Cannot load a blank node since it has no defined way to be resolved.";

export function useDataFetching(props: PropTypes,
                                context: LinkContext,
                                lastUpdate?: number,
                                setError?: (e: Error) => void) {
    React.useEffect(
        () => {
            if (props.subject && context.lrs.shouldLoadResource(props.subject)) {
                if (setError && props.subject.termType === "BlankNode") {
                    return setError(new TypeError(blankNodeWarn));
                }
                if (!!props.fetch || true) {
                    context.lrs.queueEntity((props.subject as NamedNode));
                }
            }
        },
        [props.subject, lastUpdate],
    );
}
