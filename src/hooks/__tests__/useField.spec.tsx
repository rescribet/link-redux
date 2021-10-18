import * as schema from "@ontologies/schema";
import { fireEvent, render } from "@testing-library/react";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import { useFields, useQuads } from "../useParsedField";

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

      return (
        <div
          data-testid="id"
          onClick={() => setS(s + 1)}
        >
          {s}
        </div>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    fireEvent.click(getByTestId("id"));

    expect(values).toHaveLength(2);
    expect(values[0]).toStrictEqual(values[1]);
  });

  it("retrieves a statement", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [first, second] = useQuads(
        example.ns("tags"),
      );

      return (
        <div>
          <div id="subject_0">{first?.subject?.value}</div>
          <div id="predicate_0">{first?.predicate?.value}</div>
          <div id="object_0">{first?.object?.value}</div>
          <div id="subject_1">{second?.subject?.value}</div>
          <div id="predicate_1">{second?.predicate?.value}</div>
          <div id="object_1">{second?.object?.value}</div>
        </div>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#subject_0")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#predicate_0")!.textContent).toBe(example.ns("tags").value);
    expect(container!.querySelector("#object_0")!.textContent).toBe("http://example.com/tag/0");
    expect(container!.querySelector("#subject_1")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#predicate_1")!.textContent).toBe(example.ns("tags").value);
    expect(container!.querySelector("#object_1")!.textContent).toBe("http://example.com/tag/1");
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
