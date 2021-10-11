import { isNamedNode, NamedNode, Node, SomeTerm } from "@ontologies/core";
import { normalizeType, SomeNode } from "link-lib";
import React from "react";

import { LaxNode, LinkReduxLRSType, Locator } from "../types";
import { useCalculatedValue } from "./useCalculatedValue";
import { useDataFetching } from "./useDataFetching";

import { ArityPreservingValues } from "./useParsedField";
import { useSubject } from "./useSubject";

type Digs = SomeTerm[][];
type Intermediates = SomeNode[];

const calculator = (lrs: LinkReduxLRSType, targets: LaxNode[], path: Locator[]): [Digs, Intermediates] => {
  const resolvedTerms = [];
  const resolvedTargets = new Set<Node>();

  for (const target of targets) {
    const [dugTerms, dugTargets] = lrs.digDeeper(target, path);
    resolvedTerms.push(dugTerms);
    dugTargets.forEach((subj) => resolvedTargets.add(subj));
  }

  return [
    resolvedTerms,
    Array.from(resolvedTargets),
  ];
};

/**
 * Retrieve the values at the ends of the {path}, starting at {subjects} or the context subject.
 *
 * @param path - Array of properties to traverse, following each hop the next property is looked up and followed.
 * @param subjects - The resource(s) to start at. The context subject is used if omitted.
 * @return Array of values at the end of each path, if the path couldn't be completed or no value was found at the end
 *   the element will be undefined.
 */
export function useDig<T extends LaxNode | LaxNode[] = undefined>(
  path: NamedNode[],
  subjects?: T,
): ArityPreservingValues<T, SomeTerm[]> {
  const [targets, update] = useSubject(normalizeType(subjects));
  const [intermediateUpdate, setIntermediateUpdate] = React.useState(update);
  const fetchUpdate = useDataFetching(targets.filter(isNamedNode));
  const [digs, intermediates] = useCalculatedValue(
    calculator,
    [
      update,
      intermediateUpdate,
      fetchUpdate,
    ],
    targets,
    path,
  );
  const [, lastIntermediate] = useSubject(intermediates);
  React.useEffect(() => {
    if (lastIntermediate !== intermediateUpdate) {
      setIntermediateUpdate(lastIntermediate);
    }
  }, [lastIntermediate]);

  return (Array.isArray(subjects) ? digs : digs[0]) as ArityPreservingValues<T, SomeTerm[]>;
}
