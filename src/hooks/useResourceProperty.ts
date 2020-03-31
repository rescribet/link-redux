import rdfFactory, { NamedNode, Quad, Term } from "@ontologies/core";
import { SomeNode } from "link-lib";
import React from "react";

import { toReturnType } from "../hocs/link/toReturnType";
import {
  DataHookReturnType,
  DataOpts,
  defaultOptions,
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

export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: TermOpts): Term[];
export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: StatementOpts): Quad[];
export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: LiteralOpts): ToJSOutputTypes[];
export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: ValueOpts): string[];
export function useResourceProperty(subject: LaxNode, property: LaxProperty, opts?: DataOpts): DataHookReturnType;
export function useResourceProperty(subject: LaxNode,
                                    property: LaxProperty,
                                    opts: DataOpts = defaultOptions): DataHookReturnType {

  const lrs = useLRS();
  const lastUpdate = useDataInvalidation({ subject });
  const [value, setValue] = React.useState<Quad[] | Term[] | string[] | ToJSOutputTypes[]>([]);

  React.useEffect(() => {
    if (!subject) {
      return;
    }

    const prop = lrs.getResourcePropertyRaw(
      subject,
      property || [],
    );

    const returnValue = opts.returnType === ReturnType.Statement
      ? prop
      : prop.map((p) => toReturnType(opts.returnType, p));

    setValue(returnValue as unknown as (Quad[] | Term[] | string[] | ToJSOutputTypes[]));
  }, [
    subject ? rdfFactory.id(subject) : undefined,
    property ? rdfFactory.id(property) : undefined,
    lastUpdate,
  ]);

  return value;
}
