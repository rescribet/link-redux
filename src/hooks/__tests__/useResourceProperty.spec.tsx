import schema from "@ontologies/schema";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import { ReturnType } from "../../types";
import { useResourceProperty } from "../useResourceProperty";

describe("useResourceProperty", () => {
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
      const [test] = useResourceProperty(opts.subject, schema.name);

      return <div id="test">{test?.value}</div>;
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#test")!.textContent).toBe("title");
  });

  it("retrieves a statement", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [test] = useResourceProperty(
        opts.subject,
        schema.name,
        { returnType: ReturnType.Statement },
      );

      return (
        <div>
          <div id="subject">{test?.subject?.value}</div>;
          <div id="predicate">{test?.predicate?.value}</div>;
          <div id="object">{test?.object?.value}</div>;
        </div>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#subject")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#predicate")!.textContent).toBe(schema.name.value);
    expect(container!.querySelector("#object")!.textContent).toBe("title");
  });

  /**
   * This makes it a lot easier to use the hook chained with others like useProperty;
   * When the first has no result, the chain will be empty, until the first hits and the sequential
   * hooks will start to retrieve data too.
   */
  it("allows undefined subjects", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [test] = useResourceProperty(undefined, schema.name);

      return <div id="test">{test}</div>;
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#test")!.textContent).toBe("");
  });

  /**
   * This makes it a lot easier to use the hook chained with others like useProperty.
   */
  it("allows undefined property", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [test] = useResourceProperty(opts.subject, undefined);

      return <div id="test">{test}</div>;
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#test")!.textContent).toBe("");
  });
});
