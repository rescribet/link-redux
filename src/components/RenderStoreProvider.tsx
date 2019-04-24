import * as React from "react";

import { LRSCtx } from "../contexts/LRSCtx";
import { LinkReduxLRSType } from "../types";

export interface RenderStoreProviderProps {
    children: React.ReactChild;
    value: LinkReduxLRSType;
}

export function RenderStoreProvider({ children, value }: RenderStoreProviderProps) {
    return React.createElement(
        LRSCtx.Provider,
        { value },
        children,
    );
}
