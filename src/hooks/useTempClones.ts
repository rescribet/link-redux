import rdf, { isLiteral, SomeTerm } from "@ontologies/core";
import { FieldSet, RecordState, SomeNode } from "link-lib";
import React from "react";
import ll from "../ontology/ll";
import { LinkReduxLRSType } from "../types";
import { useDataInvalidation } from "./useDataInvalidation";

import { useLRS } from "./useLRS";

type ReferenceUpdater = (term: SomeTerm) => SomeTerm;

const updatedReference = (originalIds: SomeNode[], newIds: SomeNode[]): ReferenceUpdater => (term) => {
  if (isLiteral(term)) {
    return term;
  }

  const i = originalIds.indexOf(term);

  if (i >= 0) {
    return newIds[i];
  }

  return term;
};

const cloneRecords = (lrs: LinkReduxLRSType, ids: SomeNode[]) => (): [clones: SomeNode[], cleanup: () => void] => {
  const cloneIds = ids.map(() => rdf.blankNode());

  const store = lrs.store.getInternalStore().store;
  const replaceReference = updatedReference(ids, cloneIds);

  cloneIds.forEach((_, i) => {
    cloneRecord(lrs, ids, cloneIds, i, replaceReference);
  });

  const cleanupClones = () => {
    cloneIds.forEach((id) => store.deleteRecord(id.value));
  };

  return [cloneIds, cleanupClones];
};

const filterIncomplete = (lrs: LinkReduxLRSType, ids: SomeNode[]) =>
  ids.filter((id) => lrs.getState(id.value).current !== RecordState.Present);

/**
 * Makes temporary copies of the given [ids] with internal references updated.
 * Will clear the resource when the component is unmounted.
 * @return List of cloned ids, keeps ordinality.
 */
export const useTempClones = (ids: SomeNode[]): SomeNode[] => {
  const lrs = useLRS();
  const isMountedRef = React.useRef<boolean>(false);
  const idCheck = JSON.stringify(ids);

  const [incomplete, setIncomplete] = React.useState(filterIncomplete(lrs, ids));
  const [[cloneIds, cleanup], setCloneState] = React.useState(cloneRecords(lrs, ids));

  React.useEffect(() => {
    if (isMountedRef.current) {
      setCloneState(cloneRecords(lrs, ids));
    } else {
      isMountedRef.current = true;
    }

    return cleanup;
  }, [lrs, idCheck]);

  const updated = useDataInvalidation(incomplete);

  React.useEffect(() => {
    setIncomplete(Array.from(new Set([...incomplete, ...filterIncomplete(lrs, ids)])));
  }, [idCheck]);

  React.useEffect(() => {
    const completed = incomplete
      .filter((id) => lrs.getState(id.value).current === RecordState.Present);

    if (completed.length > 0) {
      const replaceReference = updatedReference(ids, cloneIds);

      for (const id of completed) {
        cloneRecord(lrs, ids, cloneIds, ids.indexOf(id), replaceReference);
      }

      setIncomplete((prev) => filterIncomplete(lrs, prev));
    }
  }, [lrs, idCheck, updated]);

  return cloneIds;
};

const cloneRecord = (
  lrs: LinkReduxLRSType,
  ids: SomeNode[],
  cloneIds: SomeNode[],
  i: number,
  replaceReference: ReferenceUpdater,
) => {
  const store = lrs.store.getInternalStore().store;
  const id = ids[i];
  const cloneId = cloneIds[i];

  const current = store.getRecord(id.value);
  const next: FieldSet = {
    [ll.clonedFrom.value]: id,
  };

  if (current) {
    const { _id: oldId, ...fields } = current;
    const updatedFields = Object.entries(fields).reduce((acc, [field, value]) => {
      return ({
        ...acc,
        [field]: Array.isArray(value) ? value.map(replaceReference) : replaceReference(value),
      });
    }, next);

    store.setRecord(cloneId.value, updatedFields);
  } else {
    store.setRecord(cloneId.value, next);
  }
};
