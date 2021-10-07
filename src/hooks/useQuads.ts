import { Quad } from "@ontologies/core";
import { equals, SomeNode } from "link-lib";
import React from "react";
import { useDataFetching } from "./useDataFetching";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useLRS } from "./useLRS";
import { toNum } from "./useParsedField";

const EMPTY_LIST: SomeNode[] = [];

/**
 * Retrieves all quads.
 *
 * @param except - List of properties to filter out. Default empty list means don't filter.
 * @param resource - The resource to retrieve the quads from, defaults to the context subject.
 */
export const useQuads = (except: SomeNode[] = EMPTY_LIST, resource?: SomeNode): Quad[] => {
  const lrs = useLRS();
  const { subject } = useLinkRenderContext();

  const target = resource ?? subject;

  const invalidation = useDataFetching(target);
  const calc = React.useCallback(
    () => lrs.tryEntity(target).filter((q) => except.every((p) => !equals(p, q.predicate))),
    [lrs, target, toNum(except)],
  );

  const [data, setData] = React.useState<Quad[]>(calc());

  React.useEffect(() => {
    setData(calc());
  }, [lrs, target, toNum(except), invalidation]);

  return data;
};
