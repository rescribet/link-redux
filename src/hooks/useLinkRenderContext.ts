import React from "react";

import { LinkRenderCtx } from "../contexts/LinkRenderCtx";

export const useLinkRenderContext = () => React.useContext(LinkRenderCtx);
