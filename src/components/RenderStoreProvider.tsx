import React, { ReactNode } from "react";

import { LRSCtx } from "../contexts/LRSCtx";
import { LinkReduxLRSType } from "../types";

export interface RenderStoreProviderProps {
    children?: ReactNode;
    value: LinkReduxLRSType;
}

export const RenderStoreProvider: React.FC<RenderStoreProviderProps> = ({ children, value }) => {
    return React.createElement(
        LRSCtx.Provider,
        { value },
        children,
    );
};
