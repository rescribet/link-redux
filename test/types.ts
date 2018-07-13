import {
    ComponentStoreTestProxy,
    LinkedRenderStore,
    RDFStore,
    Schema,
    SomeNode,
} from "link-lib";
import { ReactElement } from "react";
import { Store } from "redux";

import {
    LinkContextReceiverProps,
    LinkCtxOverrides,
    TopologyContextType,
    TopologyType,
} from "../src/types";

export interface TestContext<T> {
    contextProps: (topology?: TopologyContextType) => LinkContextReceiverProps & LinkCtxOverrides;
    lrs: LinkedRenderStore<T>;
    mapping: ComponentStoreTestProxy<T>;
    store: RDFStore;
    schema: Schema;
    subject: SomeNode | undefined;
    reduxStore: Store;
    wrapComponent: (children?: ReactElement<any>, topology?: TopologyType) => ReactElement<any>;
}
