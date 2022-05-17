import { NamedNode } from "@ontologies/core";
import { normalizeType } from "link-lib";
import React from "react";
import { useMemoizedDataSubjects } from "../helpers";
import { LaxNode } from "../types";

import { useDataInvalidation } from "./useDataInvalidation";

import { useLRS } from "./useLRS";

/**
 * Fetches the {props.subject} if it has no data or is expired.
 *
 * @param resources The resources to fetch.
 * @return The last update stamp, useful in a hook dependency list.
 *
 * @see {LinkedRenderStore#shouldLoadResource} for the triggering mechanism.
 */
export function useDataFetching(resources: LaxNode | LaxNode[]): number {
    const lrs = useLRS();
    const lastUpdate = useDataInvalidation(resources);

    React.useEffect(
        () => {
            const toCheck = normalizeType(resources);
            for (const resource of toCheck) {
              if (resource && lrs.shouldLoadResource(resource)) {
                  lrs.queueEntity(resource as NamedNode);
              }
            }
        },
        [
          lrs,
          useMemoizedDataSubjects(resources),
          lastUpdate,
        ],
    );

    return lastUpdate;
}
