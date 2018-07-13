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
        { value: { lrs: value }},
        children,
    );
}
