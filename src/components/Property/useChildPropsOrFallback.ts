import { SomeTerm } from "@ontologies/core";
import { normalizeType } from "link-lib";
import React from "react";
import {
  PropertyPropTypes,
  renderError,
  useCalculateChildProps,
  useDataInvalidation,
  useLinkRenderContext,
  useLRS,
} from "../..";
import { normalizeDataSubjects } from "../../hooks/useDataInvalidation";
import { CalculatedChildProps } from "../../types";

export function useChildPropsOrFallback<P extends PropertyPropTypes>(props: P):
  null | React.ReactElement | [CalculatedChildProps<P>, SomeTerm[]] {

  const options = { topology: true };

  const lrs = useLRS();
  const [error, setError] = React.useState<Error|undefined>(undefined);
  const context = useLinkRenderContext();
  const subjectData = lrs.tryEntity(context.subject);

  const childProps = useCalculateChildProps(props, context, options);
  try {
    useDataInvalidation(normalizeDataSubjects(childProps));
  } catch (e) {
    setError(e);
  }
  if (subjectData.length === 0) {
    return null;
  }

  const labels = normalizeType(childProps.label)
    .filter(Boolean)
    .map((l) => l.value);
  const objRaw = subjectData
    .filter((s) => labels.includes(s.predicate.value))
    .map((s) => s.object);

  if (error) {
    return renderError(childProps, lrs, error);
  }

  if (objRaw.length === 0 && !childProps.forceRender) {
    return null;
  }

  return [childProps, objRaw];
}
