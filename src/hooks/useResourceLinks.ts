import { Node } from "@ontologies/core";
import { normalizeType} from "link-lib";
import React from "react";

import { reduceDataSubjects } from "../helpers";
import { dataPropsToPropMap } from "../hocs/link/dataPropsToPropMap";
import { globalLinkOptsDefaults } from "../hocs/link/globalLinkOptsDefaults";
import {
  ArityPreservingPropSet,
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
  opts?: D,
): Array<LinkedDataObject<T, D>> {
  const defaultedOpts = opts ?? (globalLinkOptsDefaults as D);

  const lrs = useLRS();
  const dataSubjects = normalizeType(subjects);
  const lastUpdate = useDataInvalidation(dataSubjects);

  const [propMap, requestedProperties] = React.useMemo(
    () => dataPropsToPropMap(mapDataToProps, defaultedOpts),
    [mapDataToProps, opts],
  );

  const propSets: ArityPreservingPropSet[] = React.useMemo(
    () => dataSubjects.map((subject) => {
      if (!subject) { return [subject, undefined]; }

      const record = lrs.tryRecord(subject);

      return [subject.value, record ?? { _id: subject }];
    }),
    [
      lrs,
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
