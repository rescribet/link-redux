import React from "react";

import { LinkRenderCtx } from "../contexts/LinkRenderCtx";
import { SubjectType } from "../types";

/** Get the current subject */
export function useSubject(): SubjectType {
  return React.useContext(LinkRenderCtx).subject;
}
