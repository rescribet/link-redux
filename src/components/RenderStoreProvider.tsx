import { DEFAULT_TOPOLOGY } from "link-lib";
import * as React from "react";

import { LinkReduxLRSType } from "../types";

import { Provider } from "./withLinkCtx";

export interface RenderStoreProviderProps {
    children: React.ReactChild;
    value: LinkReduxLRSType;
}

export function RenderStoreProvider({ children, value }: RenderStoreProviderProps) {
    return React.createElement(
        Provider,
        {
            value: {
                lrs: value,
                subject: undefined!,
                subjectData: [],
                subjectTimestamp: undefined,
                topology: DEFAULT_TOPOLOGY,
            },
        },
        children,
    );
}
