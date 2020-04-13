import { BlankNode, NamedNode } from "@ontologies/core";
import { DEFAULT_TOPOLOGY, id, RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useLRS } from "./useLRS";

export function useResourcePropertyView(
  subject?: NamedNode | BlankNode,
  property: NamedNode = RENDER_CLASS_NAME,
  topology: NamedNode = DEFAULT_TOPOLOGY,
): React.ElementType | undefined {
    const lrs = useLRS();
    const context = useLinkRenderContext();

    return React.useMemo(
      () => lrs.resourcePropertyComponent(
        subject || context.subject,
        property,
        topology || context.topology,
        ),
      [
        id(subject || context.subject),
        id(property),
        id(topology || context.topology),
      ],
    );
}
