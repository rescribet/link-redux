import { isNode } from "@ontologies/core";

import { LinkOpts, PropParam, ReturnType } from "./types";

const mergedMap = (predicate: PropParam): LinkOpts => {
  return isNode(predicate) || Array.isArray(predicate)
    ? { label: predicate }
    : predicate;
};

/*                                  Arity                                 */

/** Return all props from the set. */
export const all = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  limit: Infinity,
});

/** Return a limited number of props from the set. */
export const some = (predicate: PropParam, limit = 10): LinkOpts => ({
  ...mergedMap(predicate),
  limit,
});

/** Return a single prop from the set. */
export const single = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  limit: 1,
});

/*                              Return type                               */

/** Sets the return type to `ReturnType.Term`. */
export const term = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  returnType: ReturnType.Term,
});

/** Sets the return type to `ReturnType.Statement`. */
export const statement = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  returnType: ReturnType.Statement,
});

/** Sets the return type to `ReturnType.Literal`. */
export const literal = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  returnType: ReturnType.Literal,
});

/** Sets the return type to `ReturnType.Value`. */
export const value = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  returnType: ReturnType.Value,
});

/*                              Data fetching                             */

/**
 * Tell link to fetch the data if not present or stale.
 *
 * @see {hold} For opposite behaviour
 */
export const fetch = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  fetch: true,
});

/**
 * Tell link to hold current data even if unfetched or stale.
 *
 * @see {hold} For opposite behaviour
 */
export const hold = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  fetch: false,
});

/*                                Rendering                               */

/**
 * Render the component even when _no data_ could be mapped.
 */
export const renderAlways = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  forceRender: true,
});

/**
 * Only render the component when _some_ data could be mapped.
 */
export const renderPartial = (predicate: PropParam): LinkOpts => ({
  ...mergedMap(predicate),
  forceRender: false,
});
