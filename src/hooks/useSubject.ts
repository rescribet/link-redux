import { normalizeType } from "link-lib";
import React from "react";

import { LaxNode } from "../types";

import { useDataInvalidation } from "./useDataInvalidation";
import { useLinkRenderContext } from "./useLinkRenderContext";

/**
 * Keeps track of zero or more subjects with fallback to the context subject if nothing is given.
 * @param subjects The resources to invalidate on.
 * @return The subjects which have been invalidated on, and the last update time of all resources.
 */
export const useSubject = (subjects?: LaxNode | LaxNode[]): [LaxNode[], number] => {
  const getSubjects = () => (subjects !== undefined ? normalizeType<LaxNode>(subjects) : [subCtx]);

  const { subject: subCtx } = useLinkRenderContext();
  const [targets, setTargets] = React.useState<LaxNode[]>(getSubjects);

  React.useEffect(
    () => {
      const next = getSubjects();

      if (!targets.every((t, i) => t === next[i])) {
        setTargets(getSubjects);
      }
    },
    [subjects, subCtx],
  );
  const lastUpdate = useDataInvalidation(targets);

  return [targets, lastUpdate];
};
