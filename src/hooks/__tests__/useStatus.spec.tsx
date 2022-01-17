import rdfFactory from "@ontologies/core";
import { render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import { useStatus } from "../useStatus";

describe("useStatus", () => {
  it("defaults to context subject", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const status = useStatus();

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

  it("accepts blank nodes", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const status = useStatus(rdfFactory.blankNode());

      return (
        <>
          <span data-testid="type">{typeof status}</span>
        </>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("type")!.textContent).toBe("undefined");
  });

  it("handles literals", () => {
    const { wrapper } = ctx.fullCW();
    const { result: { current } } = renderHook(() => useStatus(rdfFactory.literal("")), { wrapper });

    expect(current).toEqual(undefined);
  });

  it("updates with many subject", () => {
    const subject1 = example.ns("1");
    const subject2 = example.ns("2");
    const subject3 = rdfFactory.blankNode();
    const opts = ctx.multipleCW(subject1, { second: { id: subject2, title: "title 2" } });

    const UpdateComp = () => {
      const [status2, status1, status3] = useStatus([subject2, subject1, subject3]);

      return (
        <>
          <span data-testid="type2">{typeof status2}</span>
          <span data-testid="subject2">{status2?.subject?.value}</span>
          <span data-testid="status2">{status2?.status}</span>
          <span data-testid="requested2">{status2?.requested?.toString()}</span>
          <span data-testid="lastRequested2">{status2?.lastRequested?.toISOString()}</span>
          <span data-testid="timesRequested2">{status2?.timesRequested}</span>

          <span data-testid="type1">{typeof status1}</span>
          <span data-testid="subject1">{status1?.subject?.value}</span>
          <span data-testid="status1">{status1?.status}</span>
          <span data-testid="requested1">{status1?.requested?.toString()}</span>
          <span data-testid="lastRequested1">{status1?.lastRequested?.toISOString()}</span>
          <span data-testid="timesRequested1">{status1?.timesRequested}</span>

          <span data-testid="type3">{typeof status3}</span>
        </>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("type1")!.textContent).toBe("object");
    expect(getByTestId("subject1")!.textContent).toBe(subject1.value);
    expect(getByTestId("status1")!.textContent).toBe("200");
    expect(getByTestId("requested1")!.textContent).toBe("true");
    expect(getByTestId("lastRequested1")!.textContent)
      .toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
    expect(getByTestId("timesRequested1")!.textContent).toBe("1");

    expect(getByTestId("type2")!.textContent).toBe("object");
    expect(getByTestId("subject2")!.textContent).toBe(subject2.value);
    expect(getByTestId("status2")!.textContent).toBe("200");
    expect(getByTestId("requested2")!.textContent).toBe("true");
    expect(getByTestId("lastRequested2")!.textContent)
      .toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
    expect(getByTestId("timesRequested2")!.textContent).toBe("1");

    expect(getByTestId("type3")!.textContent).toBe("undefined");
  });
});
