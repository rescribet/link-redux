import { getLinkedObjectClass } from "./components/Property";
import {
    errorComponent,
    loadingComponent,
    renderError,
} from "./components/Typable";
import { LRSCtx } from "./contexts/LRSCtx";
import { LinkRenderCtx, useCalculateChildProps } from "./hocs/withLinkCtx";

export { link } from "./hocs/link";
export { LinkedResourceContainer } from "./components/LinkedResourceContainer";
export { Property, PropertyPropTypes } from "./components/Property";
export { RenderStoreProvider } from "./components/RenderStoreProvider";
export { TopologyProvider } from "./components/TopologyProvider";
export { Type } from "./components/Type";
export { useLinkRenderContext, withLinkCtx } from "./hocs/withLinkCtx";
export { withLRS } from "./hocs/withLRS";
export { withTopology } from "./hocs/withTopology";

export { useDataFetching } from "./hooks/useDataFetching";
export { useDataInvalidation } from "./hooks/useDataInvalidation";
export { useLRS } from "./hooks/useLRS";
export { useResourceView } from "./hooks/useResourceView";
export { useView } from "./hooks/useView";

/** Prone to change */
export const unstable = {
    LRSCtx,
    LinkRenderCtx,
    errorComponent,
    getLinkedObjectClass,
    loadingComponent,
    renderError,
    useCalculateChildProps,
};

export { register } from "./register";
export * from "./types";
export * from "./propTypes";
