import "../../__tests__/useHashFactory";

import { mount } from "enzyme";
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

        return Object.keys(childProps).join();
      };

      // @ts-ignore
      const elem = mount(opts.wrapComponent(React.createElement(comp)));

      expect(elem).toHaveText("subject,topology");
    });
});
