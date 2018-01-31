import {
    ComponentStoreTestProxy,
    LinkedRenderStore,
    RDFStore,
    Schema,
} from "link-lib";
import { ReactElement } from "react";
import { Store } from "redux";

import { TopologyType } from "../src/types";

export interface TestContext<T> {
    lrs: LinkedRenderStore<T>;
    mapping: ComponentStoreTestProxy<T>;
    store: RDFStore;
    schema: Schema;
    reduxStore: Store;
    wrapComponent: (children?: ReactElement<any>, topology?: TopologyType) => ReactElement<any>;
}
