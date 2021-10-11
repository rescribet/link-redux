import { NamedNode, Term } from "@ontologies/core";
import { SomeNode } from "link-lib";

import { LinkReduxLRSType, OptionalIdentifiers } from "../types";
import { useCalculatedValue } from "./useCalculatedValue";

import { ArityPreservingValues } from "./useParsedField";
import { useSubject } from "./useSubject";

const calculator = <T extends OptionalIdentifiers = undefined>(
  lrs: LinkReduxLRSType,
  targets: T,
  path: NamedNode[],
  match: Term | Term[],
): ArityPreservingValues<T, SomeNode[]> => {
  if (targets === undefined) {
    return [];
  } else if (Array.isArray(targets)) {
    return targets.map((s) => lrs.findSubject(s, path, match)) as ArityPreservingValues<T, SomeNode[]>;
  }

  return lrs.findSubject(targets, path, match) as ArityPreservingValues<T, SomeNode[]>;
};

/**
 * Retrieve the subjects that have {match} at the ends of the {path}, starting at {subjects} or the context subject.
 *
 * @param path - Array of properties to traverse, following each hop the next property is looked up and followed.
 * @param match - The value to match the value at the end of each path against.
 * @param subjects - The resource(s) to start at. The context subject is used if omitted.
 * @return Array of subjects which match the given {match} at the end of the {path}, if the path couldn't be completed
 *   or no value was found at the end the element will be undefined.
 */
export function useFindSubject<T extends OptionalIdentifiers = undefined>(
  path: NamedNode[],
  match: Term | Term[],
  subjects?: T,
): ArityPreservingValues<T, SomeNode[]> {
  const [targets, inv] = useSubject(subjects);

  return useCalculatedValue(calculator, [inv], targets, path, match) as ArityPreservingValues<T, SomeNode[]>;
}
