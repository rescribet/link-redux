import { isNamedNode } from "@ontologies/core";
import { RequestStatus } from "link-lib";
import React from "react";

import { LaxNode } from "../types";

import { useLRS } from "./useLRS";
import { useSubject } from "./useSubject";

/**
 *  Retrieve the fetching status of {subject}. Will return the status of the context subject if no subject was passed.
 *
 *  Note that it is the request status, so blank nodes have no status.
 *
 *  @param subjects - The subject(s) to get the status for. Uses the context subject if omitted or undefined.
 *  @return A list of statuses. Cardinality with {subjects} is kept,
 *    where the first item matches {subjects} if that is not an array.
 */
export function useStatus(
  subjects?: LaxNode | LaxNode[],
): Array<RequestStatus | undefined> {
  const lrs = useLRS();
  const [targets] = useSubject(subjects);
  const [statuses, setStatuses] = React.useState<Array<RequestStatus | undefined>>([]);

  React.useEffect(() => {
    setStatuses(targets.map((t) => isNamedNode(t) ? lrs.getStatus(t) : undefined));
  }, [targets]);

  return statuses;
}
