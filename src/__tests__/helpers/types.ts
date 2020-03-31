import "jest-enzyme";
import {
    ComponentStoreTestProxy,
    LinkedRenderStore,
    RDFStore,
    Schema,
    SomeNode,
} from "link-lib";
import React from "react";
import { ResourcePropTypes } from "../../components/Resource";

import {
  LinkContext,
  LinkCtxOverrides,
  TopologyContextType,
  TopologyType,
} from "../../types";

export interface TestContext<T> {
    contextProps: (topology?: TopologyContextType) => LinkContext & LinkCtxOverrides;
    lrs: LinkedRenderStore<T>;
    mapping: ComponentStoreTestProxy<T>;
    report: jest.MockedFunction<any>;
    store: RDFStore;
    schema: Schema;
    subject: SomeNode | undefined;
    wrapComponent: (
        children?: React.ReactElement<any>,
        topology?: TopologyType,
        lrsOverride?: unknown,
        resourceProps?: Partial<ResourcePropTypes<any>>,
    ) => React.ReactElement<any>;
}
