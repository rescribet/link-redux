import "../../__tests__/useHashFactory";

import { render } from "@testing-library/react";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { useDataFetching } from "../useDataFetching";

describe("useDataFetching", () => {
    it("allows an empty subject", () => {
      const opts = ctx.fullCW();

      opts.lrs.queueEntity = jest.fn();
      const comp = () => {
        useDataFetching([]);

        return null;
      };

      render(opts.wrapComponent(React.createElement(comp)));

      expect(opts.lrs.queueEntity).not.toHaveBeenCalledTimes(1);
    });
});
