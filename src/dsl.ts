import { isNode } from "@ontologies/core";

import {
  AllLiteralsOpts,
  AllTermsOpts,
  AllValuesOpts,
  LinkOpts,
  LiteralOpts,
  MapWithReplacedReturnType,
  PropParam,
  ReturnType,
  TermOpts,
  ValueOpts,
} from "./types";

const extendsLinkOpts = (predicate: PropParam): predicate is LinkOpts =>
  !(isNode(predicate) || Array.isArray(predicate));

const mergedMap = <P extends PropParam>(predicate: P): P extends LinkOpts ? P : LinkOpts => {
  const t = extendsLinkOpts(predicate)
  ? predicate
  : { label: predicate };

  return t as P extends LinkOpts ? P : LinkOpts;
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
export const term = <P extends PropParam>(predicate: P): MapWithReplacedReturnType<P, TermOpts> => ({
  ...mergedMap(predicate),
  returnType: ReturnType.Term,
});

/** Sets the return type to `ReturnType.Literal`. */
export const literal = <P extends PropParam>(predicate: P): MapWithReplacedReturnType<P, LiteralOpts> => ({
  ...mergedMap(predicate),
  returnType: ReturnType.Literal,
});

/** Sets the return type to `ReturnType.Value`. */
export const value = <P extends PropParam>(predicate: P): MapWithReplacedReturnType<P, ValueOpts> => ({
  ...mergedMap(predicate),
  returnType: ReturnType.Value,
});

/** Sets the return type to `ReturnType.AllTerms`. */
export const terms = <P extends PropParam>(predicate: P): MapWithReplacedReturnType<P, AllTermsOpts> => ({
  ...mergedMap(predicate),
  returnType: ReturnType.AllTerms,
});

/** Sets the return type to `ReturnType.AllLiterals`. */
export const literals = <P extends PropParam>(predicate: P): MapWithReplacedReturnType<P, AllLiteralsOpts> => ({
  ...mergedMap(predicate),
  returnType: ReturnType.AllLiterals,
});

/** Sets the return type to `ReturnType.AllValues`. */
export const values = <P extends PropParam>(predicate: P): MapWithReplacedReturnType<P, AllValuesOpts> => ({
  ...mergedMap(predicate),
  returnType: ReturnType.AllValues,
});

/*                              Data fetching                             */

/**
 * Tell link to fetch the data if not present or stale.
 *
 * @see {hold} For opposite behaviour
 */
export const dereference = (predicate: PropParam): LinkOpts => ({
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
