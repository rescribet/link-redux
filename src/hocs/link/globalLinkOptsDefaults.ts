import { GlobalLinkOpts, ReturnType } from "../../types";

export const globalLinkOptsDefaults: GlobalLinkOpts = {
    fetch: true,
    forceRender: false,
    limit: 1,
    returnType: ReturnType.Term,
};
