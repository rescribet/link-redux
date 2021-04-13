import * as schema from "@ontologies/schema";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import { useLink } from "../useLink";

describe("useLink", () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container!);
    container = undefined;
  });

  it("defaults to single terms", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const props = useLink(
        {
          creation: schema.dateCreated,
        },
      );

      return (
        <p id="id0">{props.creation?.value}</p>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#id0")!.textContent).toBe("2019-01-01T00:00:00.000Z");
  });
});
