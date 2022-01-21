import { BlankNode, NamedNode } from "@ontologies/core";
import { DEFAULT_TOPOLOGY, RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import { useResourcePropertyView } from "./useResourcePropertyView";

export function useResourceView(
  subject?: NamedNode | BlankNode,
  topology: NamedNode = DEFAULT_TOPOLOGY,
): React.ElementType | undefined {
    return useResourcePropertyView(
      subject,
      RENDER_CLASS_NAME,
      topology,
    ) ?? undefined;
}
