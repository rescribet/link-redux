import "../../__tests__/useHashFactory";

import { render } from "@testing-library/react";

import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { useCalculateChildProps } from "../useCalculateChildProps";
import { useLinkRenderContext } from "../useLinkRenderContext";

describe("useCalculateChildProps", () => {
    it("allows an empty defaults", () => {
      const opts = ctx.fullCW();

      opts.lrs.queueEntity = jest.fn();
      const comp = () => {
        const context = useLinkRenderContext();
        const childProps = useCalculateChildProps({}, context);

        return (
          <>
            {Object.keys(childProps).join()}
          </>
        );
      };

      const { getByText } = render(opts.wrapComponent(React.createElement(comp)));

      expect(getByText("subject,topology")).toBeVisible();
    });
});
