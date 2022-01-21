import { id, normalizeType } from "link-lib";
import React from "react";

import { toReturnType } from "../hocs/link/toReturnType";
import {
  DataOpts,
  defaultPropertyOptions,
  LaxNode,
  LaxProperty,
  LinkReduxLRSType,
  OutputTypeFromOpts,
  OutputTypeFromReturnType,
  ReturnType,
} from "../types";
import { useDataInvalidation } from "./useDataInvalidation";

import { useLRS } from "./useLRS";

const arrayReturnTypes = [
  ReturnType.AllTerms,
  ReturnType.AllValues,
  ReturnType.AllLiterals,
];
const emptyOutput = <T extends DataOpts>(opts: T): OutputTypeFromOpts<T> => {
  return (arrayReturnTypes.includes(opts.returnType) ? [] : undefined) as OutputTypeFromOpts<T>;
};

const calculate = <T extends DataOpts>(
  lrs: LinkReduxLRSType,
  subject: LaxNode,
  property: LaxProperty,
  opts: T,
): OutputTypeFromOpts<T> => {
  if (!subject) {
    return emptyOutput(opts);
  }

  const props = lrs.getResourcePropertyRaw(
    subject,
    property,
  );

  return toReturnType(opts.returnType, props);
};

export function useResourceProperty<
  T extends DataOpts = DataOpts,
>(
  subject: LaxNode,
  property: LaxProperty,
  opts?: T,
): OutputTypeFromOpts<T, OutputTypeFromReturnType<ReturnType.AllTerms>> {
  const optsOrDefault = opts || defaultPropertyOptions as T;

  const lrs = useLRS();
  const properties = property ? normalizeType(property) : [];
  const lastUpdate = useDataInvalidation([subject, ...properties]);
  const [
    value,
    setValue,
  ] = React.useState(() => calculate<T>(lrs, subject, properties, optsOrDefault));

  React.useEffect(() => {
    const returnValue = calculate(lrs, subject, properties, optsOrDefault);

    setValue(returnValue);
  }, [
    lrs,
    subject ? id(subject) : undefined,
    properties
      .map((p) => id(p))
      .reduce((acc, next) => acc + next, 0),
    lastUpdate,
  ]);

  return value;
}
