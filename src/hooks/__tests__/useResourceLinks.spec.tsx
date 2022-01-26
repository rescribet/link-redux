import rdf from "@ontologies/core";
import * as schema from "@ontologies/schema";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import * as ctx from "../../__tests__/helpers/fixtures";
import { useResourceLinks } from "../useResourceLinks";

describe("useResourceLinks", () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container!);
    container = undefined;
  });

  it("returns empty object when resource doesn't exists", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [props] = useResourceLinks(
        [rdf.blankNode("empty")],
        {
          creation: schema.dateCreated,
        },
      );

      return (
        <div>
          <p id="id0">{props.subject?.value}</p>
          <p id="id1">{Object.keys(props).length}</p>
        </div>
    );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#id0")!.textContent).toBe("empty");
    expect(container!.querySelector("#id1")!.textContent).toBe("2");
  });

  it("returns empty object when resource is undefined", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [props] = useResourceLinks(
        undefined,
        {
          creation: schema.dateCreated,
        },
      );

      return (
        <div>
          <p id="id0">{props.subject?.value}</p>
          <p id="id1">{Object.keys(props).length}</p>
        </div>
    );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#id0")!.textContent).toBe("");
    expect(container!.querySelector("#id1")!.textContent).toBe("1");
  });
});
