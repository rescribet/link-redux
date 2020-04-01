import { BlankNode, NamedNode } from "@ontologies/core";
import { DEFAULT_TOPOLOGY, id } from "link-lib";
import React from "react";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useLRS } from "./useLRS";

export function useResourceView(subject?: NamedNode | BlankNode,
                                topology: NamedNode = DEFAULT_TOPOLOGY): React.ElementType | undefined {

    const lrs = useLRS();
    const context = useLinkRenderContext();
    const [view, setView] = React.useState<React.ComponentType | undefined>(undefined);

    React.useEffect(() => {
        setView(lrs.resourceComponent(
            subject || context.subject,
            topology || context.topology,
        ));
    }, [
      id(subject),
      id(topology),
      id(context.subject),
      id(context.topology),
    ]);

    return view;
}
