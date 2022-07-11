import rdf, { NamedNode, SomeTerm } from "@ontologies/core";
import { FieldSet, SomeNode } from "link-lib";
import React from "react";

import { useLRS } from "./useLRS";

const append = (props: Record<string, SomeTerm>, field: NamedNode, value: SomeTerm | string | undefined) => {
  if (value) {
    props[field.value] = typeof value === "string" ? rdf.literal(value) : value;
  }
};

export type FieldSetter = (field: NamedNode, value: SomeTerm | string | undefined) => void;

/**
 * @param set Will set the value on the record currently being created.
 */
export type ItemFieldBuilder<T> = (item: T, set: FieldSetter) => void;

/**
 * Derives a set of temporary records from the passed {items} and returns their ids.
 * Will clear the resources when the component is unmounted.
 *
 * Note that when passing an existing ids as {givenIds}, the original data will be cleared as well.
 * The arity of {items} and {givenIds} must match when {givenIds} is provided.
 *
 * @param items The list used to create the records from, will be passed individually to the {@link ItemFieldBuilder}.
 */
export const useTempRecords = <T>(
  items: T[],
  fields: FieldSet | ItemFieldBuilder<T>,
  deps: unknown[],
  givenIds?: SomeNode[],
): SomeNode[] => {
  const lrs = useLRS();
  const [ids, _] = React.useState(() => givenIds ?? items.map(() => rdf.blankNode()));

  const setRecord = React.useCallback(() => {
    const store = lrs.store.getInternalStore().store;

    const fieldSets = items.map((item) => {
      const set = {};

      if (typeof fields === "function") {
        const bound = (field: NamedNode, value: SomeTerm | string | undefined) => append(set, field, value);
        fields(item, bound);

        return set;
      } else {
        return {
          ...fields,
          ...set,
        };
      }
    });

    for (let i = 0, max = ids.length; i < max; i++) {
      store.setRecord(ids[i].value, fieldSets[i]);
    }

    return () => {
      for (const id of ids) {
        store.deleteRecord(id.value);
      }
    };
  }, [lrs, ids, ...deps]);

  // First render
  React.useState(setRecord);
  React.useLayoutEffect(setRecord, [setRecord]);

  return ids;
};
