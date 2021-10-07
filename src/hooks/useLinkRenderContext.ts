import React from "react";

import { LinkRenderCtx } from "../contexts/LinkRenderCtx";

/**
 * @internal `useTopology` or `useSubject` instead.
 */
export const useLinkRenderContext = () => React.useContext(LinkRenderCtx);
