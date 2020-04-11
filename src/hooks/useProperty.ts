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

export function useProperty<T extends Term[] = Term[]>(
  property: NamedNode,
  opts?: TermOpts,
): Term[];
export function useProperty<T extends Quad[] = Quad[]>(
  property: NamedNode,
  opts?: StatementOpts,
): Quad[];
export function useProperty<T extends ToJSOutputTypes[] = ToJSOutputTypes[]>(
  property: NamedNode,
  opts?: LiteralOpts,
): ToJSOutputTypes[];
export function useProperty<T extends string[] = string[]>(
  property: NamedNode,
  opts?: ValueOpts,
): string[];
export function useProperty<T extends DataHookReturnType = DataHookReturnType>(
  property: NamedNode,
  opts?: DataOpts,
): DataHookReturnType;
// @ts-ignore Used in overloads
export function useProperty<T extends DataHookReturnType = DataHookReturnType>(
  property: NamedNode,
  opts: DataOpts = defaultOptions,
): DataHookReturnType {
  const { subject } = useLinkRenderContext();

  return useResourceProperty(subject, property, opts);
}
