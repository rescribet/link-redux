import { equals } from "link-lib";
import React from "react";

import { LaxNode } from "../types";

import { useDataInvalidation } from "./useDataInvalidation";
import { useLinkRenderContext } from "./useLinkRenderContext";
import { ArityPreservingValues } from "./useParsedField";

/**
 * Keeps track of zero or more subjects with fallback to the context subject if nothing is given.
 * @param subjects The resources to invalidate on.
 * @return The subjects which have been invalidated on, and the last update time of all resources.
 */
export const useSubject = <T extends LaxNode | LaxNode[] = undefined>(subjects?: T):
  [ArityPreservingValues<T, LaxNode>, number] => {

  const { subject: subCtx } = useLinkRenderContext();
  const getSubjects = () => (subjects !== undefined ? subjects : subCtx) as
    unknown as ArityPreservingValues<T, LaxNode>;

  const [targets, setTargets] = React.useState(getSubjects);

  React.useEffect(
    () => {
      const next = getSubjects();
      const changed = (Array.isArray(targets) && Array.isArray(next))
        ? targets.length !== next.length || !targets.every((t, i) => t === next[i])
        : !equals(targets, next);

      if (changed) {
        setTargets(next);
      }
    },
    [subjects, subCtx],
  );
  const lastUpdate = useDataInvalidation(targets);

  return [
    targets,
    lastUpdate,
  ];
};
