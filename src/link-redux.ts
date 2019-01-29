import { Requireable } from "prop-types";

import { getLinkedObjectClass } from "./components/Property";
import {
    errorComponent,
    loadingComponent,
    renderError,
} from "./components/Typable";
import { calculateChildProps, LinkCtx } from "./components/withLinkCtx";

export { link } from "./components/link";
export { LinkedResourceContainer } from "./components/LinkedResourceContainer";
export { Property } from "./components/Property";
export { PropertyBase } from "./components/PropertyBase";
export { RenderStoreProvider } from "./components/RenderStoreProvider";
export { TopologyProvider } from "./components/TopologyProvider";
export { Type } from "./components/Type";
export { useLinkContext, withLinkCtx } from "./components/withLinkCtx";
export { withLRS } from "./components/withLRS";
export { withTopology } from "./components/withTopology";

export { useDataFetching } from "./hooks/useDataFetching";
export { useDataInvalidation } from "./hooks/useDataInvalidation";

/** Prone to change */
export const unstable = {
    LinkCtx,
    calculateChildProps,
    errorComponent,
    getLinkedObjectClass,
    loadingComponent,
    renderError,
};

export { register } from "./register";
export * from "./types";
export * from "./propTypes";
