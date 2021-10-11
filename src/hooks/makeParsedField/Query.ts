import { isNamedNode, isNode } from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import { equals } from "link-lib";

import { Identifier, LinkReduxLRSType } from "../../types";
import { EMPTY_ARRAY, NESTED_EMPTY_ARRAY } from "./emptyArray";
import { orderedElementsOfList, orderedElementsOfSeq } from "./iterables";
import {
  ArrayQuery,
  DataMapper,
  DigQuery,
  EmptyQuery,
  ExceptQuery,
  FieldQuery,
  Query,
  QueryType,
  Resolver,
} from "./types";

const isFieldQuery = (v: unknown): v is FieldQuery => Array.isArray(v) || isNamedNode(v);

const undefinedResolver: Resolver<EmptyQuery> = () => () => NESTED_EMPTY_ARRAY;

const simpleResolver: Resolver<FieldQuery> = (lrs: LinkReduxLRSType, query: FieldQuery) =>
  (s: Identifier | undefined) => [lrs.getResourcePropertyRaw(s, query), EMPTY_ARRAY];

const digResolver: Resolver<DigQuery> = (lrs: LinkReduxLRSType, query: DigQuery) =>
  (target: Identifier | undefined) => lrs.digDeeper(target, query.path);

const exceptResolver: Resolver<ExceptQuery> = (lrs: LinkReduxLRSType, query: ExceptQuery) =>
  (s: Identifier | undefined) => {
  if (s === undefined) {
    return NESTED_EMPTY_ARRAY;
  }

  const fields = query.fields;

  return [
    lrs.tryEntity(s).filter((q) => fields.every((p) => !equals(p, q.predicate))),
    EMPTY_ARRAY,
  ];
};

const arrayResolver: Resolver<ArrayQuery> = (lrs: LinkReduxLRSType, query: ArrayQuery) =>
  (target: Identifier | undefined) => {
    if (target === undefined) {
      return NESTED_EMPTY_ARRAY;
    }
    const targets = lrs.getResourceProperties(target, query.fields);

    for (const t of targets) {
      if (!isNode(t)) {
        continue;
      }

      const types = lrs.getResourceProperties(t, rdfx.type);

      if (types.some((type) => equals(type, rdfx.Seq) || equals(type, rdfx.Alt) || equals(type, rdfx.Bag))) {
        return orderedElementsOfSeq(lrs, t);
      }
      if (types.some((type) => equals(type, rdfx.List))) {
        return orderedElementsOfList(lrs, t);
      }
    }

    return NESTED_EMPTY_ARRAY;
  };

export const resolver = (lrs: LinkReduxLRSType, query: Query): DataMapper => {
  if (query === undefined) {
    return undefinedResolver(lrs, query);
  } else if (isFieldQuery(query)) {
    return simpleResolver(lrs, query);
  } else if (query.type === QueryType.Dig) {
    return digResolver(lrs, query);
  } else if (query.type === QueryType.Except) {
    return exceptResolver(lrs, query);
  } else if (query.type === QueryType.Array) {
    return arrayResolver(lrs, query);
  }

  throw new Error(`unknown resolver type (${query})`);
};
