/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import { mount } from "enzyme";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { LinkedRenderStoreContext } from "../../types";
import { withLRS } from "../withLRS";

const TestComponent: React.FC<LinkedRenderStoreContext> = () => React.createElement("div", null, null);
const WrappedComp = withLRS(TestComponent);

describe("withLRS hoc", () => {
    it("sets the lrs prop", () => {
        const opts = ctx.fullCW();

        const elem = React.createElement(WrappedComp);
        const tree = mount(opts.wrapComponent(elem));
        const node = tree.find("TestComponent");

        expect((node.props() as any).lrs).toEqual(opts.lrs);
    });
});
