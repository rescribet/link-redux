import { NamedNode, Node, SomeTerm } from "@ontologies/core";
import { normalizeType } from "link-lib";
import React from "react";

import { LaxNode } from "../types";

import { useLRS } from "./useLRS";
import { useSubject } from "./useSubject";

/**
 * Retrieve the values at the ends of the {path}, starting at {subjects} or the context subject.
 *
 * @param path - Array of properties to traverse, following each hop the next property is looked up and followed.
 * @param subjects - The resource(s) to start at. The context subject is used if omitted.
 * @return Array of values at the end of each path, if the path couldn't be completed or no value was found at the end
 *   the element will be undefined.
 */
export function useDig(
  path: NamedNode[],
  subjects?: LaxNode | LaxNode[],
): SomeTerm[][] {
  const lrs = useLRS();
  const [nestedTargets, setNestedTargets] = React.useState<LaxNode[]>([]);
  const [targets, update] = useSubject([...normalizeType(subjects), ...nestedTargets]);
  const [digs, setDigs] = React.useState<SomeTerm[][]>([]);

  React.useEffect(() => {
    const resolvedTerms = [];
    const resolvedTargets = new Set<Node>();

    for (const target of targets) {
      const [dugTerms, dugTargets] = lrs.digDeeper(target, path);
      resolvedTerms.push(dugTerms);
      dugTargets.forEach((subj) => resolvedTargets.add(subj));
    }

    setDigs(resolvedTerms);
    setNestedTargets(Array.from(resolvedTargets));
  }, [targets, update]);

  return digs;
}
