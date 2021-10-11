import { isNamedNode, Node } from "@ontologies/core";
import { RequestStatus, SomeRequestStatus } from "link-lib";

import { LaxNode, LinkReduxLRSType } from "../types";

import { EMPTY_ARRAY } from "./makeParsedField/emptyArray";
import { ArityPreservingValues } from "./makeParsedField/types";
import { useCalculatedValue } from "./useCalculatedValue";
import { useSubject } from "./useSubject";

const calculator = <T extends LaxNode | LaxNode[]>(lrs: LinkReduxLRSType, targets: T):
  [result: ArityPreservingValues<T, SomeRequestStatus | undefined>, subjects: Node[]] => {
  if (Array.isArray(targets)) {
    return [
      targets.map((t) => isNamedNode(t) ? lrs.getStatus(t) : undefined) as
        ArityPreservingValues<T, SomeRequestStatus | undefined>,
      EMPTY_ARRAY,
    ];
  }
  if (!isNamedNode(targets)) {
    return [undefined as ArityPreservingValues<T, SomeRequestStatus | undefined>, EMPTY_ARRAY];
  }

  return [lrs.getStatus(targets) as ArityPreservingValues<T, SomeRequestStatus | undefined>, EMPTY_ARRAY];
};

/**
 *  Retrieve the fetching status of {subject}. Will return the status of the context subject if no subject was passed.
 *
 *  Note that it is the request status, so blank nodes have no status.
 *
 *  @param subjects - The subject(s) to get the status for. Uses the context subject if omitted or undefined.
 *  @return A list of statuses. Cardinality with {subjects} is kept,
 *    where the first item matches {subjects} if that is not an array.
 */
export function useStatus<T extends LaxNode | LaxNode[] = undefined>(
  subjects?: T,
): ArityPreservingValues<T, RequestStatus | undefined> {
  const [targets, inv] = useSubject(subjects);

  return useCalculatedValue(calculator, [inv], targets) as
    ArityPreservingValues<T, RequestStatus | undefined>;
}
