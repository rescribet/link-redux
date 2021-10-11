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
  Term,
} from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import * as xsd from "@ontologies/xsd";
import { decode } from "base64-arraybuffer";
import { equals, id, normalizeType } from "link-lib";

import { bigIntTypes, numberTypes } from "../hocs/link/toReturnType";
import {
  Identifier,
  LinkReduxLRSType,
  OptionalFields,
  OptionalIdentifiers,
} from "../types";
import { useCalculatedValue } from "./useCalculatedValue";
import { useDataInvalidation } from "./useDataInvalidation";

import { useLinkRenderContext } from "./useLinkRenderContext";

export type ArityPreservingValues<K, T> = K extends any[]
    ? Array<Required<T>>
    : Required<T>;

const EMPTY_ARRAY: any[] = [];

export const toNum = (v: ReadonlyArray<Identifier|undefined>): number => v.length * v
  .map((p) => p ? id(p) : 1)
  .reduce((acc, next) => acc + next, 0);

export const useInvalidatingFields = (
  subject: OptionalIdentifiers,
  field: OptionalFields,
): [lastUpdate: number, subjects: number, fields: number] => {
  const subjects = field ? normalizeType(subject) : EMPTY_ARRAY;
  const fields = field ? normalizeType(field) : EMPTY_ARRAY;
  const lastUpdate = useDataInvalidation([
    ...subjects,
    ...fields,
  ]);

  return [lastUpdate, toNum(subjects), toNum(fields)];
};

export const calculate = <T, K extends OptionalIdentifiers = undefined>(
  lrs: LinkReduxLRSType,
  parser: (lrs: LinkReduxLRSType) => (v: Quad) => T | undefined,
  subject: K,
  property: Readonly<OptionalFields>,
): ArityPreservingValues<K, T[]> => {
  if (!subject) {
    return EMPTY_ARRAY;
  }

  const boundParser = parser(lrs);
  const calc = (s: Identifier | undefined, p: Readonly<OptionalFields>): T[] => lrs.getResourcePropertyRaw(s, p as any)
    .map(boundParser)
    .filter((it): it is T => typeof it !== "undefined");

  if (Array.isArray(subject)) {
    const values = [];

    for (let i = 0, iLen = subject.length; i < iLen; i++) {
      const t = calc(subject[i], property);
      values.push(t);
    }

    return values as ArityPreservingValues<K, T[]>;
  }

  return calc(subject, property) as ArityPreservingValues<K, T[]>;
};

export const makeParsedField = <T = Term | undefined>(
  parser: (lrs: LinkReduxLRSType) => (v: Quad) => T | undefined,
) => <K extends Node | Node[] | undefined = undefined>(
  fields: OptionalFields,
  ...resource: K[]
): ArityPreservingValues<K, T[]> => {
  const { subject } = useLinkRenderContext();
  const resourcePassed = resource.length > 0;
  const target = (resourcePassed ? resource[0] : subject) as K;
  const invalidations = useInvalidatingFields(target, fields);

  return useCalculatedValue(calculate, invalidations, parser, target, fields);
};

/**
 * Retrieves fields of any type as raw terms.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useQuad = makeParsedField<Quad>(
  (_) => (it) => it,
);

/**
 * Retrieves all fields as internal representation.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useField = makeParsedField<SomeTerm>(
  (_) => (it) => isTerm(it.object) ? it.object : undefined,
);

/**
 * Retrieves fields which contain association.
 * @param {fields} {Node} - The field to retrieve from the record.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useIdentifier = makeParsedField<Node>(
  (_) => (it) => isNode(it.object) ? it.object : undefined,
);

/**
 * Retrieves fields which contain namedNode.
 * @param {fields} {Node} - The field to retrieve from the record.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useLocator = makeParsedField<NamedNode>(
  (_) => (it) => isNamedNode(it.object) ? it.object : undefined,
);

// TODO: Different hook which filters on on- and off-site?

/**
 * Retrieves fields which contain blankNode.
 * @param {fields} {Node} - The field to retrieve from the record.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useAnonymousId = makeParsedField<BlankNode>(
  (_) => (it) => isBlankNode(it.object) ? it.object : undefined,
);

/**
 * Retrieves fields which contain literal.
 * @param {fields} {Node} - The field to retrieve from the record.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useLiteral = makeParsedField<Literal>(
  (_) => (it) => isLiteral(it.object) ? it.object : undefined,
);

/**
 * Retrieves all value {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useValue = makeParsedField<string>(
  (_) => (it) => it.object.value,
);

/**
 * Retrieves all literalValue {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useLiteralValue = makeParsedField<string>(
  (_) => (it) => isLiteral(it.object) ? it.object.value : undefined,
);

/**
 * Retrieves all base64 {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useBase64 = makeParsedField<ArrayBuffer>((_) => (quad) => {
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
export const useBigInt = makeParsedField<BigInt>((_) => (quad) => {
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
export const useBoolean = makeParsedField<boolean>((_) => (quad) => {
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
export const useDate = makeParsedField<Date>((_) => (quad) => {
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
export const useAnyString = makeParsedField<RegularOrString>((_) => (quad) => {
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
export const useLangString = makeParsedField<LangString>((_) => (quad) => {
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
export const useRegularString = makeParsedField<string>((_) => (quad) => {
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
export const useString = makeParsedField<string>((_) => (quad) => {
  const it = quad.object;
  if (!isLiteral(it) || !equals(it.datatype, rdfx.langString) || !equals(it.datatype, xsd.string)) {
    return undefined;
  }

  return it.value;
});

/**
 * Retrieves all number {fields}.
 * @param resource {Node} - The resource to look up. Defaults to the context subject.
 */
export const useNumber = makeParsedField<number>((lrs) => (quad) => {
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
export const useUrl = makeParsedField<URL>((lrs) => (quad) => {
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
