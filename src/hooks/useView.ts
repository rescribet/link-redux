import { NamedNode } from "@ontologies/core";
import { RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useLRS } from "./useLRS";

/**
 * @unstable
 */
export function useView(type: NamedNode | NamedNode[] | undefined,
                        predicate: NamedNode | NamedNode[] = RENDER_CLASS_NAME,
                        topology?: NamedNode): React.ElementType | undefined {

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
