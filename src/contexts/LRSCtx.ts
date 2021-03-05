import { DataProcessor, LinkedDataAPI } from "link-lib";
import React, { Context } from "react";

import { LinkReduxLRSType } from "../types";

export const LinkedRenderStoreCtx = React.createContext<LinkReduxLRSType>(undefined!);

export type LRSContext<T = any, API extends LinkedDataAPI = DataProcessor> = Context<LinkReduxLRSType<T, API>>;

export const LRSCtx = LinkedRenderStoreCtx as LRSContext;
