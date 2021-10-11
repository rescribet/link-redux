import { LaxIdentifier } from "../../types";
import { useLinkRenderContext } from "../useLinkRenderContext";

import { Query } from "./types";

export type TargetTuple = [targets: LaxIdentifier | LaxIdentifier[], fields: Query];

export const useTargetedQuery = (
  resource: LaxIdentifier | LaxIdentifier[] | Query,
  fields: Query | null,
): TargetTuple => {
  const { subject } = useLinkRenderContext();

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
