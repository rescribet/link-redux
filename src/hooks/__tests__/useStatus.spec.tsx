import { render } from "@testing-library/react";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import { useStatus } from "../useStatus";

describe("useStatus", () => {
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
      const status = useStatus();

      return (
          <>
            <span id="type">{typeof status}</span>
            <span id="subject">{status?.subject.value}</span>
            <span id="status">{status?.status}</span>
            <span id="requested">{status?.requested?.toString()}</span>
            <span id="lastRequested">{status?.lastRequested?.toISOString()}</span>
            <span id="timesRequested">{status?.timesRequested}</span>
          </>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#type")!.textContent).toBe("object");
    expect(container!.querySelector("#subject")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#status")!.textContent).toBe("200");
    expect(container!.querySelector("#requested")!.textContent).toBe("true");
    expect(container!.querySelector("#lastRequested")!.textContent)
      .toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
    expect(container!.querySelector("#timesRequested")!.textContent).toBe("1");
  });

  it("accepts undefined", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const status = useStatus(undefined);

      return (
        <>
          <span data-testid="type">{typeof status}</span>
          <span data-testid="subject">{status?.subject.value}</span>
          <span data-testid="status">{status?.status}</span>
          <span data-testid="requested">{status?.requested?.toString()}</span>
          <span data-testid="lastRequested">{status?.lastRequested?.toISOString()}</span>
          <span data-testid="timesRequested">{status?.timesRequested}</span>
        </>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("type")!.textContent).toBe("object");
    expect(getByTestId("subject")!.textContent).toBe(opts.subject!.value);
    expect(getByTestId("status")!.textContent).toBe("200");
    expect(getByTestId("requested")!.textContent).toBe("true");
    expect(getByTestId("lastRequested")!.textContent)
      .toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
    expect(getByTestId("timesRequested")!.textContent).toBe("1");
  });

  it("updates with many subject", () => {
    const subject1 = example.ns("1");
    const subject2 = example.ns("2");
    const opts = ctx.multipleCW(subject1, { second: { id: subject2, title: "title 2" } });

    const UpdateComp = () => {
      const [status2, status1] = useStatus([subject2, subject1]);

      return (
        <>
          <span id="type2">{typeof status2}</span>
          <span id="subject2">{status2?.subject?.value}</span>
          <span id="status2">{status2?.status}</span>
          <span id="requested2">{status2?.requested?.toString()}</span>
          <span id="lastRequested2">{status2?.lastRequested?.toISOString()}</span>
          <span id="timesRequested2">{status2?.timesRequested}</span>

          <span id="type1">{typeof status1}</span>
          <span id="subject1">{status1?.subject?.value}</span>
          <span id="status1">{status1?.status}</span>
          <span id="requested1">{status1?.requested?.toString()}</span>
          <span id="lastRequested1">{status1?.lastRequested?.toISOString()}</span>
          <span id="timesRequested1">{status1?.timesRequested}</span>
        </>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#type1")!.textContent).toBe("object");
    expect(container!.querySelector("#subject1")!.textContent).toBe(subject1.value);
    expect(container!.querySelector("#status1")!.textContent).toBe("200");
    expect(container!.querySelector("#requested1")!.textContent).toBe("true");
    expect(container!.querySelector("#lastRequested1")!.textContent)
      .toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
    expect(container!.querySelector("#timesRequested1")!.textContent).toBe("1");

    expect(container!.querySelector("#type2")!.textContent).toBe("object");
    expect(container!.querySelector("#subject2")!.textContent).toBe(subject2.value);
    expect(container!.querySelector("#status2")!.textContent).toBe("200");
    expect(container!.querySelector("#requested2")!.textContent).toBe("true");
    expect(container!.querySelector("#lastRequested2")!.textContent)
      .toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
    expect(container!.querySelector("#timesRequested2")!.textContent).toBe("1");
  });
});
