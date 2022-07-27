import rdf, { isLiteral, SomeTerm } from "@ontologies/core";
import { FieldSet, SomeNode } from "link-lib";
import React from "react";
import ll from "../ontology/ll";
import { LinkReduxLRSType } from "../types";

import { useLRS } from "./useLRS";

const updatedReference = (originalIds: SomeNode[], newIds: SomeNode[]) => (term: SomeTerm): SomeTerm => {
  if (isLiteral(term)) {
    return term;
  }

  const i = originalIds.indexOf(term);

  if (i >= 0) {
    return newIds[i];
  }

  return term;
};

const cloneRecords = (lrs: LinkReduxLRSType, ids: SomeNode[]) => (): [SomeNode[], () => void] => {
  const cloneIds = ids.map(() => rdf.blankNode());

  const store = lrs.store.getInternalStore().store;
  const replaceReference = updatedReference(ids, cloneIds);

  cloneIds.map((id, i) => {
    const current = store.getRecord(ids[i].value);
    const next: FieldSet = {
      [ll.clonedFrom.value]: ids[i],
    };

    if (current) {
      const { _id: oldId, ...fields } = current;
      const updatedFields = Object.entries(fields).reduce((acc, [field, value]) => {
        return ({
          ...acc,
          [field]: Array.isArray(value) ? value.map(replaceReference) : replaceReference(value),
        });
      }, next);

      store.setRecord(id.value, updatedFields);
    } else {
      store.setRecord(id.value, next);
    }
  });

  const cleanupClones = () => {
    cloneIds.forEach((id) => store.deleteRecord(id.value));
  };

  return [cloneIds, cleanupClones];
};

/**
 * Makes temporary copies of the given [ids] with internal references updated.
 * Will clear the resource when the component is unmounted.
 * @return List of cloned ids, keeps idempotency.
 */
export const useTempClones = (ids: SomeNode[]): SomeNode[] => {
  const lrs = useLRS();
  const isMountedRef = React.useRef<boolean>(false);
  const idCheck = JSON.stringify(ids);

  const [[clonedIds, cleanup], setCloneState] = React.useState(cloneRecords(lrs, ids));

  React.useEffect(() => {
    if (isMountedRef.current) {
      setCloneState(cloneRecords(lrs, ids));
    } else {
      isMountedRef.current = true;
    }

    return cleanup;
  }, [idCheck]);

  return clonedIds;
};
