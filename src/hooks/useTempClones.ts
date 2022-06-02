import rdf, { isLiteral, SomeTerm } from "@ontologies/core";
import { SomeNode } from "link-lib";
import React from "react";

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

/**
 * Makes temporary copies of the given [ids] with internal references updated.
 * Will clear the resource when the component is unmounted.
 * @return List of cloned ids, keeps idempotency.
 */
export const useTempClones = (ids: SomeNode[]): SomeNode[] => {
  const isMountedRef = React.useRef<boolean>(false);
  const lrs = useLRS();

  const generateIds = () => ids.map(() => rdf.blankNode());

  const [newIds, setNewIds] = React.useState(generateIds);

  const setRecord = React.useCallback(() => {
    const store = lrs.store.getInternalStore().store;
    const replaceReference = updatedReference(ids, newIds);

    newIds.map((id, i) => {
      const { _id: __, ...fields } = store.getRecord(ids[i].value)!;

      const updatedFields = Object.entries(fields).reduce((acc, [field, value]) => {
        return ({
          ...acc,
          [field]: Array.isArray(value) ? value.map(replaceReference) : replaceReference(value),
        });
      }, {});

      store.setRecord(id.value, updatedFields);
    });

    return () => newIds.forEach((id) => store.deleteRecord(id.value));
  }, [lrs, newIds]);

  React.useEffect(() => {
    if (isMountedRef.current) {
      setRecord();
    } else {
      setNewIds(generateIds());
      isMountedRef.current = true;
    }
  }, [ids]);

  React.useEffect(setRecord, [setRecord]);

  return newIds;
};
