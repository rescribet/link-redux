import rdfFactory, { isNamedNode, Node } from "@ontologies/core";
import { normalizeType } from "link-lib";
import React from "react";

import { dataPropsToPropMap } from "../hocs/link/dataPropsToPropMap";
import ll from "../ontology/ll";
import { LinkOpts, MapDataToPropsParam } from "../types";
import { useDataInvalidation } from "./useDataInvalidation";

import { PropertyBoundProps } from "./useLinkedObjectProperties";
import { useLRS } from "./useLRS";
import { useManyLinkedObjectProperties } from "./useManyLinkedObjectProperties";

export function useResourceLinks(
  subjects: Node | Node[],
  mapDataToProps: MapDataToPropsParam,
  opts: LinkOpts = {},
): Array<PropertyBoundProps<typeof mapDataToProps>> {
  const dataSubjects = normalizeType(subjects);
  const lrs = useLRS();
  const [propMap, requestedProperties] = React.useMemo(
    () => dataPropsToPropMap(mapDataToProps, opts),
    [mapDataToProps],
  );
  const lastUpdate = useDataInvalidation(dataSubjects);

  const propSets = React.useMemo(
    () => {
      const sets = [];
      const len = dataSubjects.length;

      for (let i = 0; i < len; i++) {
        const subject = dataSubjects[i];
        const subjectData = lrs.tryEntity(subject);
        const subjProps = [
          // Ensure the first item's subject is always the data subject
          rdfFactory.quad(subject, ll.dataSubject, ll.nop),
        ];
        for (let j = 0; j < subjectData.length; j++) {
          if (requestedProperties.includes(rdfFactory.id(subjectData[j].predicate))) {
            subjProps.push(subjectData[j]);
          }
        }
        sets.push(subjProps);
      }

      return sets;
    },
    [dataSubjects, requestedProperties, lastUpdate],
  );

  return useManyLinkedObjectProperties(
    propSets,
    propMap,
    opts.returnType || ReturnType.Literal,
  );
}
