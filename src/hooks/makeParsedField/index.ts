import { Node, Quadruple, Term } from "@ontologies/core";

import { Identifier, LaxIdentifier, LinkReduxLRSType, OptionalIdentifiers } from "../../types";
import { useCalculatedValue } from "../useCalculatedValue";
import { useDataFetching } from "../useDataFetching";

import { NESTED_EMPTY_ARRAY } from "./emptyArray";
import { resolver } from "./Query";
import { ArityPreservingValues, FieldLookupOverloads, Query } from "./types";
import { useTargetedQuery } from "./useTargetedQuery";

export const calculate = <T, K extends OptionalIdentifiers = undefined>(
  lrs: LinkReduxLRSType,
  subject: K,
  parser: (lrs: LinkReduxLRSType) => (v: Quadruple) => T | undefined,
  query: Query,
): [result: ArityPreservingValues<K, T[]>, subjects: Node[]] => {
  if (!subject) {
    return NESTED_EMPTY_ARRAY;
  }

  const boundParser = parser(lrs);
  const mapper = resolver(lrs, query);
  const calc = (s: Identifier | undefined): [T[], Node[]] => {
    const [values, targets] = mapper(s);
    const mapped = values
      .map(boundParser)
      .filter((it): it is T => typeof it !== "undefined");

    return [mapped, targets];
  };

  if (Array.isArray(subject)) {
    const values = [];
    const subjects = [];

    for (let i = 0, iLen = subject.length; i < iLen; i++) {
      const [t, targets] = calc(subject[i]);
      values.push(t);
      subjects.push(...targets);
    }

    return [values as ArityPreservingValues<K, T[]>, []];
  }

  return calc(subject) as [result: ArityPreservingValues<K, T[]>, subjects: Node[]];
};

export const makeParsedField = <
  T = Term | undefined,
  R extends FieldLookupOverloads<T> = FieldLookupOverloads<T>,
>(
  parser: (lrs: LinkReduxLRSType) => (v: Quadruple) => T | undefined,
): R => {
  const dataHook: unknown = (
    resource: LaxIdentifier | LaxIdentifier[] | Query,
    field: Query | null = null,
  ): ReturnType<R> => {
    const [targets, query] = useTargetedQuery(resource, field);
    const invalidation = useDataFetching(targets);

    return useCalculatedValue(calculate, [query, invalidation], targets, parser, query) as ReturnType<R>;
  };

  return dataHook as R;
};
