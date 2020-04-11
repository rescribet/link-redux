import { NamedNode } from "@ontologies/core";
import React from "react";

import { LinkReduxLRSType } from "../../types";
import { PropertyWrappedProps } from "../Property";

export function getLinkedObjectClass({ label, subject, topology, topologyCtx }: PropertyWrappedProps,
                                     lrs: LinkReduxLRSType,
                                     labelOverride?: NamedNode): React.ComponentType | undefined {
  return lrs.resourcePropertyComponent(
    subject,
    labelOverride || label,
    topology === null ? undefined : topology || topologyCtx,
  );
}
