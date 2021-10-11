import { equals } from "link-lib";
import React from "react";
import { LinkReduxLRSType } from "../types";
import { useLRS } from "./useLRS";

const hasChanged = (old: any, next: any): boolean => {
  const isArray = Array.isArray(next);
  if (!isArray) {
    return equals(old, next);
  }

  if (typeof old !== typeof next && (isArray && !Array.isArray(old))) {
    return false;
  }

  return old.length !== next.length ||
    old.some((q: unknown, i: number) => !equals(q, next[i]));
};

export const useCalculatedValue = <T, K extends any[]>(
  calculator: (lrs: LinkReduxLRSType, ...args: K) => T,
  invalidations: unknown[],
  ...args: K
): T => {
  const lrs = useLRS();
  const isMountRef = React.useRef(true);

  const [
    value,
    setValue,
  ] = React.useState<T>((): T => calculator(lrs, ...args));

  React.useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false;

      return;
    }

    const nextValue = calculator(lrs, ...args);
    if (hasChanged(value, nextValue)) {
      setValue(nextValue);
    }
  }, [
    lrs,
    ...invalidations,
  ]);

  return value;
};
