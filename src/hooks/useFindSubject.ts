import { NamedNode, SomeTerm, Term } from "@ontologies/core";
import React from "react";

import { LaxNode } from "../types";

import { useLRS } from "./useLRS";
import { useSubject } from "./useSubject";

/**
 * Retrieve the subjects that have {match} at the ends of the {path}, starting at {subjects} or the context subject.
 *
 * @param path - Array of properties to traverse, following each hop the next property is looked up and followed.
 * @param match - The value to match the value at the end of each path against.
 * @param subjects - The resource(s) to start at. The context subject is used if omitted.
 * @return Array of subjects which match the given {match} at the end of the {path}, if the path couldn't be completed
 *   or no value was found at the end the element will be undefined.
 */
export function useFindSubject(
  path: NamedNode[],
  match: Term | Term[],
  subjects?: LaxNode | LaxNode[],
): SomeTerm[][] {
  const lrs = useLRS();
  const [targets] = useSubject(subjects);
  const [digs, setDigs] = React.useState<SomeTerm[][]>([]);

  React.useEffect(() => {
    setDigs(targets.map((s) => lrs.findSubject(s, path, match)));
  }, [targets]);

  return digs;
}
