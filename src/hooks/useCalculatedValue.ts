import { Node } from "@ontologies/core";
import { equals } from "link-lib";
import React from "react";

import { LaxNode, LinkReduxLRSType } from "../types";
import { useDataFetching } from "./useDataFetching";
import { useLRS } from "./useLRS";

export const hasChanged = (old: any, next: any): boolean => {
  const isArray = Array.isArray(next);
  if (!isArray) {
    return !equals(old, next);
  }

  if (typeof old !== typeof next || (isArray && !Array.isArray(old))) {
    return true;
  }

  return old.length !== next.length ||
    old.some((q: unknown, i: number) => !equals(q, next[i]));
};

/**
 * Runs the applicable {calculator} only once while also giving the result on the first render.
 */
export const useCalculatedValue = <T, K extends any[]>(
  calculator: (lrs: LinkReduxLRSType, targets: LaxNode | LaxNode[], ...args: K) => [result: T, subjects: Node[]],
  invalidations: unknown[],
  subjects: LaxNode | LaxNode[],
  ...args: K
): T => {
  const lrs = useLRS();

  const invalidation = useDataFetching(subjects);

  return React.useMemo(
    () => calculator(lrs, subjects, ...args)[0],
    [
      lrs,
      invalidation,
      subjects,
      ...invalidations,
    ],
  );
};
