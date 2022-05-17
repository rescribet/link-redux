import { SomeNode } from "link-lib";
import React from "react";
import { LinkRenderCtx } from "../contexts/LinkRenderCtx";
import { FCWithChildren, TopologyType } from "../types";

const toDisplayName = (topology: TopologyType) => {
  const name = topology?.value?.split(/[\/#]/)?.pop()?.split("?")?.shift() || "";

  return `TP(${name[0].toUpperCase()}${name.slice(1)})`;
};

/**
 * Basic building block for making a topology.
 *
 * The returned tuple contains a component that sets the given topology along with the current subject for convenience.
 * @param topology The topology Iri.
 * @returns A tuple containing the topology provider component and the current subject.
 */
export const useTopologyProvider = (topology: TopologyType): [topologyProvider: FCWithChildren, subject: SomeNode] => {
  const prevContext = React.useContext(LinkRenderCtx);

  const newContext = React.useMemo(() => ({
    ...prevContext,
    topology: topology === null ? undefined : topology,
  }), [topology, prevContext]);

  const Provider = React.useCallback<FCWithChildren>(({ children }) => {
    return (
      <LinkRenderCtx.Provider value={newContext}>
        {children}
      </LinkRenderCtx.Provider >
    );
  }, [newContext]);

  Provider.displayName = toDisplayName(topology);

  return [Provider, newContext.subject];
};
