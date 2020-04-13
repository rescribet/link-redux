/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import { mount } from "enzyme";
import { DEFAULT_TOPOLOGY } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { TopologyContextProp } from "../../types";
import { withTopology } from "../withTopology";

const TestComponent: React.FC<TopologyContextProp> = () => React.createElement("div", null, null);
const WrappedComp = withTopology(TestComponent);

describe("withTopology hoc", () => {
    it("sets the topology prop", () => {
        const opts = ctx.fullCW();

        const elem = React.createElement(WrappedComp);
        const tree = mount(opts.wrapComponent(elem));
        const node = tree.find("TestComponent");

        expect((node.props() as any).topology).toEqual(DEFAULT_TOPOLOGY);
    });
});
