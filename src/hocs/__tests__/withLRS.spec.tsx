/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import { render } from "@testing-library/react";

import { DEFAULT_TOPOLOGY } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { TopologyContextProp } from "../../types";
import { withTopology } from "../withTopology";

describe("withTopology hoc", () => {
    it("sets the topology prop", () => {
        const opts = ctx.fullCW();

        const TestComponent: React.FC<TopologyContextProp> = ({ topology }) =>
          React.createElement("div", {  "data-testid": "id" }, topology?.value);
        const WrappedComp = withTopology(TestComponent);

        const elem = React.createElement(WrappedComp);
        const { getByTestId } = render(opts.wrapComponent(elem));
        const node = getByTestId("id");

        expect(node).toHaveTextContent(DEFAULT_TOPOLOGY.value);
    });
});
