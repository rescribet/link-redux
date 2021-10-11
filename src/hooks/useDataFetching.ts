import { isBlankNode } from "@ontologies/core";
import { normalizeType } from "link-lib";
import React from "react";
import { reduceDataSubjects } from "../helpers";
import { LaxNode } from "../types";

import { useDataInvalidation } from "./useDataInvalidation";

import { useLRS } from "./useLRS";

const blankNodeWarn = "Cannot load a blank node since it has no defined way to be resolved.";

/**
 * Fetches the {props.subject} if it has no data or is expired.
 *
 * @param resources The resources to fetch.
 * @param setError Is called when trying to load blank nodes, otherwise the request will fail.
 * @return The last update stamp, useful in a hook dependency list.
 *
 * @see {LinkedRenderStore#shouldLoadResource} for the triggering mechanism.
 */
export function useDataFetching(
  resources: LaxNode | LaxNode[],
  setError?: (e: Error) => void,
): number {
    const lrs = useLRS();
    const lastUpdate = useDataInvalidation(resources);

    React.useEffect(
        () => {
            const toCheck = normalizeType(resources);
            for (const resource of toCheck) {
              if (resource && lrs.shouldLoadResource(resource)) {
                  const report = setError || lrs.report;

                  if (isBlankNode(resource)) {
                      return report(new TypeError(blankNodeWarn));
                  }

                  lrs.queueEntity(resource);
              }
            }
        },
        [
          lrs,
          reduceDataSubjects(resources),
          lastUpdate,
        ],
    );

    return lastUpdate;
}
