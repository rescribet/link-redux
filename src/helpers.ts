import { equals } from "link-lib";

/**
 * Useful for using as a hook update dependency.
 */
export function useMemoizedDataSubjects<T, K extends T | T[] | undefined>(subjects: K): string {
  return JSON.stringify(subjects);
}

export const calculatedValueChanged = (a: unknown, b: unknown): boolean => (Array.isArray(a) && Array.isArray(b))
  ? a.length !== b.length || !a.every((t, i) => t === b[i])
  : !equals(a, b);
