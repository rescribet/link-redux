import rdfFactory, { isNamedNode, Node } from "@ontologies/core";
import { id, normalizeType } from "link-lib";
import React from "react";

import { dataPropsToPropMap } from "../hocs/link/dataPropsToPropMap";
import { globalLinkOptsDefaults } from "../hocs/link/globalLinkOptsDefaults";
import ll from "../ontology/ll";
import {
  LaxNode,
  LinkedDataObject,
  LinkOpts,
  MapDataToPropsParam,
  TermOpts,
} from "../types";
import { useDataInvalidation } from "./useDataInvalidation";

import { useLRS } from "./useLRS";
import { useManyLinkedObjectProperties } from "./useManyLinkedObjectProperties";

export function useResourceLinks<
  T extends MapDataToPropsParam = {},
  D extends LinkOpts = TermOpts,
>(
  subjects: LaxNode | Node[],
  mapDataToProps: T,
  opts: D,
): Array<LinkedDataObject<T, D>> {

  const dataSubjects = normalizeType(subjects);
  const lrs = useLRS();
  const [propMap, requestedProperties] = React.useMemo(
    () => dataPropsToPropMap(mapDataToProps, opts),
    [mapDataToProps, opts],
  );
  const lastUpdate = useDataInvalidation(dataSubjects);

  const propSets = React.useMemo(
    () => {
      const sets = [];
      const len = dataSubjects.length;

      for (let i = 0; i < len; i++) {
        const subject = dataSubjects[i];
        if (!subject) {
          // Preserve order
          sets.push([]);
          continue;
        }

        if ((opts.fetch ?? globalLinkOptsDefaults.fetch)
            && isNamedNode(subject)
            && lrs.shouldLoadResource(subject)) {
          lrs.queueEntity(subject);
        }

        const subjectData = lrs.tryEntity(subject);
        const subjProps = [
          // Ensure the first item's subject is always the data subject
          rdfFactory.quad(subject, ll.dataSubject, ll.nop),
        ];

        for (let j = 0; j < subjectData.length; j++) {
          if (requestedProperties.includes(id(subjectData[j].predicate))) {
            subjProps.push(subjectData[j]);
          }
        }

        sets.push(subjProps);
      }

      return sets;
    },
    [dataSubjects, requestedProperties, lastUpdate],
  );

  const test = useManyLinkedObjectProperties<typeof propMap>(
    propSets,
    propMap,
  );

  return test;
}
