import React from "react";

import { LinkRenderCtx } from "../contexts/LinkRenderCtx";
import { TopologyType } from "../types";

/** Get the current topology */
export function useTopology(): TopologyType {
  return React.useContext(LinkRenderCtx).topology;
}
