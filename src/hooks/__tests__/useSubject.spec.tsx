import rdfFactory from "@ontologies/core";
import { render, screen } from "@testing-library/react";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import { LaxNode } from "../../types";
import { useSubject } from "../useSubject";

describe("useSubject", () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container!);
    container = undefined;
  });

  it("defaults to context subject", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [[subject]] = useSubject();

      return (
          <span id="subject">{subject!.value}</span>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#subject")!.textContent).toBe(opts.subject!.value);
  });

  it("updates the subjects on change", () => {
    const opts = ctx.fullCW();

    const UpdateComp = ({ subjects }: { subjects?: LaxNode[] }) => {
      const [[subject]] = useSubject(subjects);

      return (
          <span data-testid="subject">{subject!.value}</span>
      );
    };

    const { rerender } = render(opts.wrapComponent(<UpdateComp />));

    expect(screen.getByTestId("subject").textContent).toBe(opts.subject!.value);

    const next = rdfFactory.blankNode();
    rerender(opts.wrapComponent(<UpdateComp subjects={[next]} />));

    expect(screen.getByTestId("subject").textContent).toBe(next.value);
  });
});
