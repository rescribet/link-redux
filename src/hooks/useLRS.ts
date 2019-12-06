import React from "react";

import { LRSCtx } from "../contexts/LRSCtx";
import { LinkReduxLRSType } from "../types";

export function useLRS(): LinkReduxLRSType {
    return React.useContext(LRSCtx);
}
