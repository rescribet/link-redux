import { DEFAULT_TOPOLOGY } from "link-lib";
import React from "react";

import { LinkRenderContext } from "../types";

export const LinkRenderCtx = React.createContext<LinkRenderContext>(
    {
        subject: undefined!,
        topology: DEFAULT_TOPOLOGY,
    },
);
