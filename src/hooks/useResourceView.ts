import rdfFactory, { BlankNode, NamedNode } from "@ontologies/core";
import { DEFAULT_TOPOLOGY } from "link-lib";
import * as React from "react";

import { useLinkRenderContext } from "../hocs/withLinkCtx";
import { useLRS } from "./useLRS";

export function useResourceView(subject?: NamedNode | BlankNode,
                                topology: NamedNode = DEFAULT_TOPOLOGY): React.ElementType | undefined {

    const lrs = useLRS();
    const context = useLinkRenderContext();
    const [view, setView] = React.useState<React.ReactType | undefined>(undefined);

    React.useEffect(() => {
        setView(lrs.resourceComponent(
            subject || context.subject,
            topology || context.topology,
        ));
    }, [
      rdfFactory.id(subject),
      rdfFactory.id(topology),
      rdfFactory.id(context.subject),
      rdfFactory.id(context.topology),
    ]);

    return view;
}
