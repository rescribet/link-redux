import * as schema from "@ontologies/schema";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import { register } from "../../register";
import { FC } from "../../types";
import { useView } from "../useView";

describe("useView", () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container!);
    container = undefined;
  });

  it("looks up the view", () => {
    const opts = ctx.fullCW();

    const A: FC = () => React.createElement("div", { id: "id0" }, "A");
    A.type = schema.Thing;
    const B: FC = () => React.createElement("div", { id: "id0" }, "B");
    B.type = schema.CreativeWork;

    opts.lrs.registerAll(...[...register(A), ...register(B)]);

    const UpdateComp = () => {
      const Comp = useView(schema.CreativeWork);

      return (
        <React.Fragment>
          {Comp && <Comp/>}
        </React.Fragment>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#id0")!.textContent).toBe("B");
  });
});
