import rdfFactory, { isNamedNode, isNode, Node, Quad } from "@ontologies/core";
import { id, normalizeType } from "link-lib";
import React from "react";
import { reduceDataSubjects } from "../helpers";

import { dataPropsToPropMap } from "../hocs/link/dataPropsToPropMap";
import { globalLinkOptsDefaults } from "../hocs/link/globalLinkOptsDefaults";
import ll from "../ontology/ll";
import {
  LaxNode,
  LinkedDataObject,
  LinkOpts, LinkReduxLRSType,
  MapDataToPropsParam,
  TermOpts,
} from "../types";
import { useDataInvalidation } from "./useDataInvalidation";

import { useLRS } from "./useLRS";
import { useManyLinkedObjectProperties } from "./useManyLinkedObjectProperties";

const buildPropSets = <D extends LinkOpts>(
  lrs: LinkReduxLRSType,
  dataSubjects: Node[],
  requestedProperties: number[],
  opts: D,
): Quad[][] => {
  const sets: Quad[][] = [];
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
      rdfFactory.quad(subject, ll.dataSubject, subject),
    ];

    for (let j = 0; j < subjectData.length; j++) {
      if (requestedProperties.includes(id(subjectData[j].predicate))) {
        subjProps.push(subjectData[j]);
      }
    }

    sets.push(subjProps);
  }

  return sets;
};

export function useResourceLinks<
  T extends MapDataToPropsParam = {},
  D extends LinkOpts = TermOpts,
>(
  subjects: LaxNode | Node[],
  mapDataToProps: T,
  opts?: D,
): Array<LinkedDataObject<T, D>> {
  const defaultedOpts = opts ?? (globalLinkOptsDefaults as D);

  const lrs = useLRS();
  const dataSubjects = normalizeType(subjects).filter(isNode);
  const lastUpdate = useDataInvalidation(dataSubjects);

  const [propMap, requestedProperties] = React.useMemo(
    () => dataPropsToPropMap(mapDataToProps, defaultedOpts),
    [mapDataToProps, opts],
  );

  const propSets = React.useMemo(
    () => buildPropSets<D>(lrs, dataSubjects, requestedProperties, defaultedOpts),
    [
      reduceDataSubjects(dataSubjects),
      requestedProperties,
      lastUpdate,
    ],
  );

  return useManyLinkedObjectProperties<typeof propMap, any, LinkedDataObject<T, D>>(
    propSets,
    propMap,
    defaultedOpts.returnType,
  );
}
