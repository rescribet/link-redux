import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { register } from "../../register";
import { FC } from "../../types";
import { useResourceView } from "../useResourceView";

describe("useResourceView", () => {
  it("looks up the view", () => {
    const opts = ctx.fullCW();

    const A: FC = () => React.createElement("div", { "data-testid": "id0" }, "A");
    A.type = schema.Thing;
    const B: FC = () => React.createElement("div", { "data-testid": "id0" }, "B");
    B.type = schema.CreativeWork;

    opts.lrs.registerAll(...[...register(A), ...register(B)]);

    const UpdateComp = () => {
      const Comp = useResourceView(opts.subject);

      return (
        <React.Fragment>
          {Comp && <Comp/>}
        </React.Fragment>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("id0")!.textContent).toBe("B");
  });
});
