import { DataProcessor, LinkedDataAPI } from "link-lib";
import React from "react";

import { LRSCtx } from "../contexts/LRSCtx";
import { LinkReduxLRSType } from "../types";

/** Get the nearest LRS. */
export function useLRS<
  P = any,
  API extends LinkedDataAPI = DataProcessor,
  LRS = LinkReduxLRSType<P, API>,
>(): LRS {
    return React.useContext(LRSCtx) as unknown as LRS;
}
