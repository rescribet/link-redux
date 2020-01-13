import { NamedNode, Quad, Term } from "@ontologies/core";

import {
  DataHookReturnType,
  DataOpts,
  defaultOptions,
  LiteralOpts,
  StatementOpts,
  TermOpts,
  ToJSOutputTypes,
  ValueOpts,
} from "../types";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useResourceProperty } from "./useResourceProperty";

export function useProperty(property: NamedNode, opts?: TermOpts): Term[];
export function useProperty(property: NamedNode, opts?: StatementOpts): Quad[];
export function useProperty(property: NamedNode, opts?: LiteralOpts): ToJSOutputTypes[];
export function useProperty(property: NamedNode, opts?: ValueOpts): string[];
export function useProperty(property: NamedNode, opts?: DataOpts): DataHookReturnType;
export function useProperty(property: NamedNode, opts: DataOpts = defaultOptions): DataHookReturnType {
  const { subject } = useLinkRenderContext();

  return useResourceProperty(subject, property, opts);
}
