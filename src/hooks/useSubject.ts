import { equals } from "link-lib";
import React from "react";

import { LaxNode } from "../types";
import { ArityPreservingValues } from "./makeParsedField/types";
import { useDataFetching } from "./useDataFetching";

import { useLinkRenderContext } from "./useLinkRenderContext";

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

  const targetsRef = React.useRef([] as unknown as ArityPreservingValues<T, LaxNode>);

  const targets = React.useMemo(
    () => {
      const next = getSubjects();
      const changed = (Array.isArray(targetsRef.current) && Array.isArray(next))
        ? targetsRef.current.length !== next.length || !targetsRef.current.every((t, i) => t === next[i])
        : !equals(targetsRef.current, next);

      if (changed) {
        targetsRef.current = next;

        return next;
      }

      return targetsRef.current;
    },
    [subjects, subCtx],
  );
  const lastUpdate = useDataFetching(targets);

  return [
    targets,
    lastUpdate,
  ];
};
