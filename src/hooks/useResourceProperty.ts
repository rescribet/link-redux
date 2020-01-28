import { NamedNode, Quad, Term } from "@ontologies/core";
import { SomeNode } from "link-lib";
import React from "react";

import { id } from "../factoryHelpers";
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

export function useResourceProperty(subject: SomeNode, property: NamedNode, opts?: TermOpts): Term[];
export function useResourceProperty(subject: SomeNode, property: NamedNode, opts?: StatementOpts): Quad[];
export function useResourceProperty(subject: SomeNode, property: NamedNode, opts?: LiteralOpts): ToJSOutputTypes[];
export function useResourceProperty(subject: SomeNode, property: NamedNode, opts?: ValueOpts): string[];
export function useResourceProperty(subject: SomeNode, property: NamedNode, opts?: DataOpts): DataHookReturnType;
export function useResourceProperty(subject: SomeNode,
                                    property: NamedNode,
                                    opts: DataOpts = defaultOptions): DataHookReturnType {

  const lrs = useLRS();
  const lastUpdate = useDataInvalidation({ subject });
  const [value, setValue] = React.useState<Quad[] | Term[] | string[] | ToJSOutputTypes[]>([]);

  React.useEffect(() => {
    const prop = lrs.getResourcePropertyRaw(
      subject,
      property,
    );

    const returnValue = opts.returnType === ReturnType.Statement
      ? prop
      : prop.map((p) => toReturnType(opts.returnType, p));

    setValue(returnValue as unknown as (Quad[] | Term[] | string[] | ToJSOutputTypes[]));
  }, [
    id(subject),
    id(property),
    lastUpdate,
  ]);

  return value;
}
