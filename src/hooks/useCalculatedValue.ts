import { Node } from "@ontologies/core";
import { equals } from "link-lib";
import React from "react";

import { LinkReduxLRSType } from "../types";

import { useLRS } from "./useLRS";
import { useSubject } from "./useSubject";

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
  calculator: (lrs: LinkReduxLRSType, ...args: K) => [result: T, subjects: Node[]],
  invalidations: unknown[],
  ...args: K
): T => {
  const lrs = useLRS();
  const isMountRef = React.useRef(true);

  const [
    value,
    setValue,
  ] = React.useState<[result: T, subjects: Node[]]>(() => calculator(lrs, ...args));
  const [, invalidation] = useSubject(value[1]);

  React.useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false;

      return;
    }

    const nextValue = calculator(lrs, ...args);
    if (hasChanged(value[0], nextValue[0]) || hasChanged(value[1], nextValue[1])) {
      setValue(nextValue);
    }
  }, [
    lrs,
    invalidation,
    ...invalidations,
  ]);

  return value[0];
};
