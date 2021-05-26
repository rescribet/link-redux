import { isNode, Quad } from "@ontologies/core";
import React from "react";

import { LaxNode } from "../types";

import { useLRS } from "./useLRS";
import { useSubject } from "./useSubject";

/**
 *  Retrieve the entity without fetching.
 *
 *  @param subjects - The subject(s) to get the status for. Uses the context subject if omitted or undefined.
 *  @return A list of quads per resource. Cardinality with {subjects} is kept,
 *    where the first item matches {subjects} if that is not an array.
 */
export function useTryEntity(
  subjects?: LaxNode | LaxNode[],
): Array<Quad[] | undefined> {
  const lrs = useLRS();
  const [targets] = useSubject(subjects);
  const [entities, setEntities] = React.useState<Array<Quad[] | undefined>>([]);

  React.useEffect(() => {
    setEntities(targets.map((t) => isNode(t) ? lrs.tryEntity(t) : undefined));
  }, [lrs, targets]);

  return entities;
}
