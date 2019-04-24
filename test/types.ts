import "jest-enzyme";
import {
    ComponentStoreTestProxy,
    LinkedRenderStore,
    RDFStore,
    Schema,
    SomeNode,
} from "link-lib";
import { ReactElement } from "react";

import {
    LinkContext,
    LinkCtxOverrides,
    TopologyContextType,
    TopologyType,
} from "../src/types";

export interface TestContext<T> {
    contextProps: (topology?: TopologyContextType) => LinkContext & LinkCtxOverrides;
    lrs: LinkedRenderStore<T>;
    mapping: ComponentStoreTestProxy<T>;
    store: RDFStore;
    schema: Schema;
    subject: SomeNode | undefined;
    wrapComponent: (children?: ReactElement<any>, topology?: TopologyType, lrsOverride?: unknown) => ReactElement<any>;
}
