import { NamedNode, Quad, Term } from "@ontologies/core";
import { id, SomeNode } from "link-lib";
import React from "react";

import { toReturnType } from "../hocs/link/toReturnType";
import {
  DataHookReturnType,
  DataOpts,
  defaultOptions,
  LinkReduxLRSType,
  LiteralOpts,
  ReturnType,
  StatementOpts,
  TermOpts,
  ToJSOutputTypes,
  ValueOpts,
} from "../types";
import { useDataInvalidation } from "./useDataInvalidation";

import { useLRS } from "./useLRS";

type LaxNode = SomeNode | undefined;
type LaxProperty = NamedNode | undefined;

const calculate = (
  lrs: LinkReduxLRSType,
  subject: LaxNode,
  property: LaxProperty,
  opts: DataOpts,
) => {
  if (!subject) {
    return [];
  }

  const prop = lrs.getResourcePropertyRaw(
    subject,
    property || [],
  );

  return opts.returnType === ReturnType.Statement
    ? prop
    : prop.map((p) => toReturnType(opts.returnType, p));
};

export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: TermOpts): Term[];
export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: StatementOpts): Quad[];
export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: LiteralOpts): ToJSOutputTypes[];
export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: ValueOpts): string[];
export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: DataOpts): DataHookReturnType;
export function useResourceProperty(subject: LaxNode,
                                    property: LaxProperty,
                                    opts: DataOpts = defaultOptions): DataHookReturnType {

  const lrs = useLRS();
  const lastUpdate = useDataInvalidation(subject);
  const [
    value,
    setValue,
  ] = React.useState<Quad[] | Term[] | string[] | ToJSOutputTypes[]>(() => calculate(lrs, subject, property, opts));

  React.useEffect(() => {
    const returnValue = calculate(lrs, subject, property, opts);

    setValue(returnValue as unknown as (Quad[] | Term[] | string[] | ToJSOutputTypes[]));
  }, [
    subject ? id(subject) : undefined,
    property ? id(property) : undefined,
    lastUpdate,
  ]);

  return value;
}
