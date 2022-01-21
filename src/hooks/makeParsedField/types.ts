import { NamedNode, Quadruple, Term } from "@ontologies/core";
import { SomeNode } from "link-lib";

import { Identifier, LaxIdentifier, LinkReduxLRSType } from "../../types";

export enum QueryType {
  Except,
  Dig,
  Array,
}

export interface ExceptQuery {
  type: QueryType.Except;
  fields: NamedNode[];
}

export interface DigQuery {
  type: QueryType.Dig;
  path: Array<NamedNode | NamedNode[]>;
}

export interface ArrayQuery {
  type: QueryType.Array;
  fields: NamedNode[];
}

export type ComplexQuery = ExceptQuery | DigQuery | ArrayQuery;
export type EmptyQuery = undefined;
export type FieldQuery = NamedNode | NamedNode[];
export type Query = ComplexQuery | FieldQuery | EmptyQuery;
export type NestedBoundData = [data: Quadruple[], targets: SomeNode[]];
export type DataMapper = (s: Identifier | undefined) => NestedBoundData;
export type Resolver<T extends Query> = (lrs: LinkReduxLRSType, query: T) => DataMapper;
export type ArityPreservingValues<K, T> = K extends any[]
  ? Array<Required<T>>
  : Required<T>;

export interface FieldLookupOverloads<
  T = Term | undefined,
  K extends LaxIdentifier | LaxIdentifier[] | Query = undefined,
> {
  (resource: K, field: Query | null): ArityPreservingValues<K, T[]>;

  (fields: Query): ArityPreservingValues<LaxIdentifier, T[]>;

  (resource: LaxIdentifier, fields: Query): ArityPreservingValues<LaxIdentifier, T[]>;

  (resource: LaxIdentifier[], fields: Query): ArityPreservingValues<LaxIdentifier[], T[]>;
}
