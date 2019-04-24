import { RENDER_CLASS_NAME } from "link-lib";
import { NamedNode } from "rdflib";
import * as React from "react";

import { useLinkRenderContext } from "../hocs/withLinkCtx";
import { useLRS } from "./useLRS";

/**
 * @unstable
 */
export function useView(type: NamedNode | NamedNode[] | undefined,
                        predicate: NamedNode | NamedNode[] = RENDER_CLASS_NAME,
                        topology?: NamedNode): React.ReactType | undefined {

    const lrs = useLRS();
    const context = useLinkRenderContext();

    return React.useMemo(() =>
        lrs.getComponentForProperty(
            type,
            predicate,
            topology || context.topology,
        ),
        [type, predicate, topology || context.topology],
    );
}
