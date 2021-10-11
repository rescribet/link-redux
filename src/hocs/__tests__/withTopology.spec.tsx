/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import { render } from "@testing-library/react";

import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { LinkedRenderStoreContext } from "../../types";
import { withLRS } from "../withLRS";

describe("withLRS hoc", () => {
    it("sets the lrs prop", () => {
        const opts = ctx.fullCW();

        let given;
        const TestComponent: React.FC<LinkedRenderStoreContext> = ({ lrs }): null => {
          given = lrs;

          return null;
        };
        const WrappedComp = withLRS(TestComponent);
        const elem = React.createElement(WrappedComp);
        render(opts.wrapComponent(elem));

        expect(given).toEqual(opts.lrs);
    });
});
