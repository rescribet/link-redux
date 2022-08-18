import { NamedNode } from "@ontologies/core";
import React from "react";
import { LinkRenderCtx } from "../contexts/LinkRenderCtx";

export type TopologyFC<P = unknown> = React.FC<React.PropsWithChildren<P>>;

const toDisplayName = (topology: NamedNode) => {
  const name = topology.value.split(/[\/#]/).pop()?.split("?")?.shift() || topology.value;

  return `TP(${name[0].toUpperCase()}${name.slice(1)})`;
};

/**
 * Basic building block for making a topology.
 * @param topology The topology Iri.
 * @returns The topology provider component.
 */
export const createTopologyProvider = (topology: NamedNode): TopologyFC => {
  const Provider: TopologyFC = ({ children }) => {
    const prevContext = React.useContext(LinkRenderCtx);

    const newContext = React.useMemo(() => ({
      ...prevContext,
      topology,
    }), [topology, prevContext]);

    return (
      <LinkRenderCtx.Provider value={newContext}>
        {children}
      </LinkRenderCtx.Provider>
    );
  };
  Provider.displayName = toDisplayName(topology);

  return Provider;
};
