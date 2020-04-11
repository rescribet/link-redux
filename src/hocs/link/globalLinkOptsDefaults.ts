import { GlobalLinkOpts, ReturnType } from "../../types";

export const globalLinkOptsDefaults: GlobalLinkOpts = {
    fetch: true,
    forceRender: false,
    limit: Infinity,
    returnType: ReturnType.Term,
};
