import { DEFAULT_TOPOLOGY } from "link-lib";
import { BlankNode, NamedNode } from "rdflib";
import * as React from "react";

import { useLinkRenderContext } from "../hocs/withLinkCtx";
import { useLRS } from "./useLRS";

export function useResourceView(subject?: NamedNode | BlankNode,
                                topology: NamedNode = DEFAULT_TOPOLOGY): React.ReactType | undefined {

    const lrs = useLRS();
    const context = useLinkRenderContext();
    const [view, setView] = React.useState<React.ReactType | undefined>(undefined);

    React.useEffect(() => {
        setView(lrs.resourceComponent(
            subject || context.subject,
            topology || context.topology,
        ));
    }, [subject, topology, context.subject, context.topology]);

    return view;
}
