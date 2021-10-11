import {
  BlankNode,
  isBlankNode,
  isLiteral,
  isNamedNode,
  isNode,
  isTerm,
  Literal,
  NamedNode,
  Node,
  Quad,
  SomeTerm,
} from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import * as xsd from "@ontologies/xsd";
import { decode } from "base64-arraybuffer";
import { equals } from "link-lib";

import { bigIntTypes, numberTypes } from "../hocs/link/toReturnType";
import { makeParsedField } from "./makeParsedField/index";
import {
  ArrayQuery,
  DigQuery,
  ExceptQuery,
  QueryType,
} from "./makeParsedField/types";

/**
 * Will resolve all fields except those passed.
 */
export const except = (...fields: NamedNode[]): ExceptQuery => ({
  fields,
  type: QueryType.Except,
});

/**
 * Will resolve fields at the end of {path}, traversing intermediate records.
 */
export const dig = (...path: Array<NamedNode | NamedNode[]>): DigQuery => ({
  path,
  type: QueryType.Dig,
});

/**
 * Experimental. Will unpack {fields} if their value refers to rdf:Seq, rdf:List, rdf:Container, rdf:Bag.
 * Note that their values will be returned top-level, rather than nested.
 * Has undefined behaviour with regards to multimap values.
 */
export const array = (...fields: NamedNode[]): ArrayQuery => ({
  fields,
  type: QueryType.Array,
});

/**
 * Retrieves fields of any type as raw terms.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useQuads = makeParsedField<Quad>(
  (_) => (it) => it,
);

/**
 * Retrieves all fields as internal representation.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useFields = makeParsedField<SomeTerm>(
  (_) => (it) => isTerm(it.object) ? it.object : undefined,
);

/**
 * Retrieves fields which contain association.
 * @param {fields} {Node} - The field to retrieve from the record.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useIds = makeParsedField<Node>(
  (_) => (it) => isNode(it.object) ? it.object : undefined,
);

/**
 * Retrieves fields which contain namedNode.
 * @param {fields} {Node} - The field to retrieve from the record.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useGlobalIds = makeParsedField<NamedNode>(
  (_) => (it) => isNamedNode(it.object) ? it.object : undefined,
);

// TODO: Different hook which filters on on- and off-site?

/**
 * Retrieves fields which contain blankNode.
 * @param {fields} {Node} - The field to retrieve from the record.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useLocalIds = makeParsedField<BlankNode>(
  (_) => (it) => isBlankNode(it.object) ? it.object : undefined,
);

/**
 * Retrieves fields which contain literal.
 * @param {fields} {Node} - The field to retrieve from the record.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useLiterals = makeParsedField<Literal>(
  (_) => (it) => isLiteral(it.object) ? it.object : undefined,
);

/**
 * Retrieves all value {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useValues = makeParsedField<string>(
  (_) => (it) => it.object.value,
);

/**
 * Retrieves all literalValue {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useLiteralValues = makeParsedField<string>(
  (_) => (it) => isLiteral(it.object) ? it.object.value : undefined,
);

/**
 * Retrieves all base64 {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useBase64s = makeParsedField<ArrayBuffer>((_) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !equals(it.datatype, xsd.base64Binary)) {
    return undefined;
  }

  return decode(it.value);
});

/**
 * Retrieves all bigInt {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useBigInts = makeParsedField<BigInt>((_) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !bigIntTypes.some((type) => equals(it.datatype, type))) {
    return undefined;
  }

  return BigInt(it.value);
});

/**
 * Retrieves all boolean {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useBooleans = makeParsedField<boolean>((_) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !equals(it.datatype, xsd.xsdboolean)) {
    return undefined;
  }

  return it.value === "true" || it.value === "1" || it.value === "t";
});

/**
 * Retrieves all date {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useDates = makeParsedField<Date>((_) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !(equals(it.datatype, xsd.dateTime) || equals(it.datatype, xsd.date))) {
    return undefined;
  }

  return new Date(it.value);
});

export type RegularOrString = [value: string, language: string | undefined];

/**
 * Retrieves all langString and string {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useAnyStrings = makeParsedField<RegularOrString>((_) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !equals(it.datatype, rdfx.langString) || !equals(it.datatype, xsd.string)) {
    return undefined;
  }

  return [it.value, it.language];
});

export type LangString = [value: string, language: string];

/**
 * Retrieves all langString {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useLangStrings = makeParsedField<LangString>((_) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !equals(it.datatype, rdfx.langString)) {
    return undefined;
  }

  return [it.value, it.language!];
});

/**
 * Retrieves all string {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useRegularStrings = makeParsedField<string>((_) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !equals(it.datatype, xsd.string)) {
    return undefined;
  }

  return it.value;
});

/**
 * Retrieves all string and lang string {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useStrings = makeParsedField<string>((_) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !(equals(it.datatype, rdfx.langString) || equals(it.datatype, xsd.string))) {
    return undefined;
  }

  return it.value;
});

/**
 * Retrieves all number {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useNumbers = makeParsedField<number>((lrs) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !numberTypes.some((type) => equals(it.datatype, type))) {
    return undefined;
  }

  const n = Number(it.value);

  if (isNaN(n)) {
    lrs.report(new Error(`useNumber value was NaN: '${it.value}' on ${quad}`));

    return undefined;
  }

  return n;
});

/**
 * Retrieves all url {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useUrls = makeParsedField<URL>((lrs) => (quad) => {
  const it = quad.object;
  if (!isNamedNode(it)) {
    return undefined;
  }

  try {
    return new URL(it.value);
  } catch (e: any) {
    lrs.report(e);

    return undefined;
  }
});
