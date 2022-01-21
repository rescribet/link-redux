import { SomeTerm } from "@ontologies/core";
import React from "react";

import { useCalculateChildProps } from "../../hooks/useCalculateChildProps";
import { normalizeDataSubjects } from "../../hooks/useDataInvalidation";
import { useDataInvalidation } from "../../hooks/useDataInvalidation";
import { useLinkRenderContext } from "../../hooks/useLinkRenderContext";
import { useLRS } from "../../hooks/useLRS";
import { CalculatedChildProps } from "../../types";
import { PropertyPropTypes } from "../Property";
import { renderError } from "../Typable";

export function useChildPropsOrFallback<P extends PropertyPropTypes>(props: P):
  null | React.ReactElement | [CalculatedChildProps<P>, SomeTerm[]] {

  const options = { topology: true };

  const lrs = useLRS();
  const [error, setError] = React.useState<Error|undefined>(undefined);
  const context = useLinkRenderContext();
  const subjectData = lrs.tryRecord(context.subject);

  const childProps = useCalculateChildProps(props, context, options);
  try {
    useDataInvalidation(normalizeDataSubjects(childProps));
  } catch (e: any) {
    setError(e);
  }
  if (subjectData === undefined || childProps.label === undefined) {
    return null;
  }

  let values: SomeTerm[] = [];
  if (Array.isArray(childProps.label)) {
    values = childProps.label.reduce<SomeTerm[]>((acc, l) => {
      const v = subjectData[l.value];
      if (Array.isArray(v)) {
        return [...acc, ...v];
      } else if (v !== undefined) {
        return [...acc, v];
      } else {
        return acc;
      }
    }, []);
  } else {
    const v = subjectData[childProps.label.value];
    if (Array.isArray(v)) {
      values = v;
    } else if (v !== undefined) {
      values = [v];
    }
  }

  if (error) {
    return renderError(childProps, lrs, error);
  }

  if (values.length === 0 && !childProps.forceRender) {
    return null;
  }

  return [childProps, values];
}
