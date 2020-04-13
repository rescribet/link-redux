import {
  DataOpts,
  defaultPropertyOptions,
  LaxProperty,
  OutputTypeFromOpts,
  OutputTypeFromReturnType,
  ReturnType,
} from "../types";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useResourceProperty } from "./useResourceProperty";

export function useProperty<
  T extends DataOpts = DataOpts,
>(
  property: LaxProperty,
  opts?: T,
): OutputTypeFromOpts<T, OutputTypeFromReturnType<ReturnType.AllTerms>> {
  const optsOrDefault = opts || defaultPropertyOptions as T;
  const { subject } = useLinkRenderContext();

  return useResourceProperty(subject, property, optsOrDefault);
}
