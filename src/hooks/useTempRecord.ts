import rdf, { NamedNode, SomeTerm } from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import { FieldSet, SomeNode } from "link-lib";
import React from "react";

import { useLRS } from "./useLRS";

const append = (props: Record<string, SomeTerm>, field: NamedNode, value: SomeTerm | string | undefined) => {
  if (value) {
    props[field.value] = typeof value === "string" ? rdf.literal(value) : value;
  }
};

export type FieldBuilder = (set: (field: NamedNode, value: SomeTerm | string | undefined) => void) => void;

/**
 * Writes a temporary record into the store and returns its id.
 * Will clear the resource when the component is unmounted.
 */
export const useTempRecord = (type: NamedNode, fields: FieldSet | FieldBuilder, deps: unknown[]): SomeNode => {
  const lrs = useLRS();

  const [id, _] = React.useState(() => rdf.blankNode());

  const fieldSet = React.useMemo(() => {
    const set = {
      [rdfx.type.value]: type,
    };

    if (typeof fields === "function") {
      const bound = (field: NamedNode, value: SomeTerm | string | undefined) => append(set, field, value);

      fields(bound);

      return set;
    } else {
      return {
        ...fields,
        ...set,
      };
    }
  }, [...deps]);

  const setRecord = React.useCallback(() => {
    const store = lrs.store.getInternalStore().store;
    store.setRecord(id.value, fieldSet);

    return () => store.deleteRecord(id.value);
  }, [lrs, id, fieldSet]);

  // First render
  React.useState(setRecord);
  React.useLayoutEffect(setRecord, [setRecord]);

  return id;
};
