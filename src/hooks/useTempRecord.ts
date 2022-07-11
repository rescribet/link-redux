import { NamedNode } from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import { FieldSet, SomeNode } from "link-lib";
import React from "react";

import { FieldSetter, useTempRecords } from "./useTempRecords";

export type FieldBuilder = (set: FieldSetter) => void;

/**
 * Writes a temporary record into the store and returns its id.
 * Will clear the resource when the component is unmounted.
 *
 * Note that when passing an existing id as {givenId}, the original data will be cleared as well.
 */
export const useTempRecord = (
  type: NamedNode,
  fields: FieldSet | FieldBuilder,
  deps: unknown[],
  givenId?: SomeNode,
): SomeNode => {
  let enhancedFields;

  if (typeof fields === "function") {
    enhancedFields = (__: undefined, set: FieldSetter) => {
      set(rdfx.type, type);
      fields(set);
    };
  } else {
    enhancedFields = {
      [rdfx.type.value]: type,
      ...fields,
    };
  }

  const memoizedId = React.useMemo(() => givenId ? [givenId] : undefined, [givenId]);

  return useTempRecords([undefined], enhancedFields, deps, memoizedId)[0];
};
