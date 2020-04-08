import { Quad, Term } from "@ontologies/core";
import { id } from "link-lib";
import React from "react";

import { toReturnType } from "../hocs/link/toReturnType";
import {
  DataHookReturnType,
  DataOpts,
  defaultOptions,
  LaxNode,
  LaxProperty,
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

export function useResourceProperty<T extends Term[] = Term[]>(
  subject: LaxNode,
  property: LaxProperty,
  opts?: TermOpts,
): T;
export function useResourceProperty<T extends Quad[] = Quad[]>(
  subject: LaxNode,
  property: LaxProperty,
  opts?: StatementOpts,
): T;
export function useResourceProperty<T extends ToJSOutputTypes[] = ToJSOutputTypes[]>(
  subject: LaxNode,
  property: LaxProperty,
  opts?: LiteralOpts,
): T;
export function useResourceProperty<T extends string[] = string[]>(
  subject: LaxNode,
  property: LaxProperty,
  opts?: ValueOpts,
): T;
export function useResourceProperty<T extends DataHookReturnType = DataHookReturnType>(
  subject: LaxNode,
  property: LaxProperty,
  opts?: DataOpts,
): T;
// @ts-ignore TS6133 Used in overloads
export function useResourceProperty<T extends DataHookReturnType = DataHookReturnType>(
  subject: LaxNode,
  property: LaxProperty,
  opts: DataOpts = defaultOptions,
): Quad[] | Term[] | string[] | ToJSOutputTypes[] {

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
