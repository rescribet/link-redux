import { Node } from "@ontologies/core";
import React from "react";

import { LaxIdentifier } from "../../types";
import { useLinkRenderContext } from "../useLinkRenderContext";

import { Query } from "./types";
import { queryChanged } from "./useTargetedQuery/queryChanged";
import { targetsChanged } from './useTargetedQuery/targetsChanged';

export type TargetTuple = [targets: LaxIdentifier | LaxIdentifier[], fields: Query];

const calculate = (
  subject: Node,
  resource: LaxIdentifier | LaxIdentifier[] | Query,
  fields: Query | null,
): TargetTuple => {
  if (fields === null) {
    return [subject, resource as Query];
  }

  const multipleFields = Array.isArray(fields);
  const multipleResources = Array.isArray(resource);

  if (fields === undefined || resource === undefined) {
    return [undefined, undefined];
  } else if (multipleFields && fields.length === 0 || multipleResources && resource.length === 0) {
    return [undefined, undefined];
  }

  return [resource as LaxIdentifier[], fields];
};

export const useTargetedQuery = (
  resource: LaxIdentifier | LaxIdentifier[] | Query,
  query: Query | null,
): TargetTuple => {
  const { subject } = useLinkRenderContext();
  const [targets, setTargets] = React.useState<LaxIdentifier | LaxIdentifier[]>(() =>
    calculate(subject, resource, query)[0]);
  const [fields, setFields] = React.useState<Query>(() => calculate(subject, resource, query)[1]);

  React.useEffect(() => {
    const [nextTargets, nextFields] = calculate(subject, resource, query);

    if (targetsChanged(targets, nextTargets)) {
      setTargets(nextTargets);
    }

    if (queryChanged(fields, nextFields)) {
      setFields(nextFields);
    }
  }, [subject, resource, query]);

  return [targets, fields];
};
