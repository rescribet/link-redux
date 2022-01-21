import { BlankNode, NamedNode } from "@ontologies/core";
import { DEFAULT_TOPOLOGY, RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useLRS } from "./useLRS";

export function useResourcePropertyView(
  subject?: NamedNode | BlankNode,
  predicate: NamedNode = RENDER_CLASS_NAME,
  topology: NamedNode = DEFAULT_TOPOLOGY,
): React.ElementType | undefined {
    const lrs = useLRS();
    const context = useLinkRenderContext();

    return lrs.resourcePropertyComponent(
      subject || context.subject,
      predicate,
      topology || context.topology,
    ) ?? undefined;
}
