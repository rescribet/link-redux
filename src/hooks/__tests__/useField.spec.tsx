import * as schema from "@ontologies/schema";
import { fireEvent, render } from "@testing-library/react";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import { useFields } from "../useParsedField";

describe("useFields", () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container!);
    container = undefined;
  });

  it("retrieves a property", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [test] = useFields(schema.name);

      return <div id="test">{test?.value}</div>;
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#test")!.textContent).toBe("title");
  });

  it("memoized between renders", () => {
    const opts = ctx.fullCW();
    const values: any[] = [];

    const UpdateComp = () => {
      const tags = useFields(example.ns("tags"));
      values.push(tags);

      const [s, setS] = React.useState(0);
      const handleClick = () => setS(s + 1);

      return (
        <div
          data-testid="id"
          onClick={handleClick}
        >
          {s}
        </div>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    fireEvent.click(getByTestId("id"));

    expect(values).toHaveLength(2);
    expect(values[0] === values[1]).toBeTruthy();
  });

  /**
   * This makes it a lot easier to use the hook chained with others like useFields.
   */
  it("allows undefined property", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [test] = useFields(undefined);

      return <div id="test">{test}</div>;
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#test")!.textContent).toBe("");
  });
});
