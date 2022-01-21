import rdfFactory, { QuadPosition } from "@ontologies/core";
import * as ld from "@ontologies/ld";
import * as rdfx from "@ontologies/rdf";
import * as schema from "@ontologies/schema";
import { act, render, waitFor } from "@testing-library/react";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import { array, except, useQuadruples, useValues } from "../useParsedField";

describe("array", () => {
  it("maps sequence to values", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const quads = useValues(array(schema.comment));
      const [first, second, third, fourth] = quads;

      return (
        <div>
          <div data-testid="len">{quads.length}</div>
          <div data-testid="e0">{first}</div>
          <div data-testid="e1">{second}</div>
          <div data-testid="e2">{third}</div>
          <div data-testid="e3">{fourth}</div>
        </div>
      );
    };

    const { getByTestId } = render(<UpdateComp />,  { wrapper: opts.wrapper });

    expect(getByTestId("len")!.textContent).toBe("4");
    expect(getByTestId("e0")!.textContent).toBe("e1");
    expect(getByTestId("e1")!.textContent).toBe("e2");
    expect(getByTestId("e2")!.textContent).toBe("e3");
    expect(getByTestId("e3")!.textContent).toBe("e4");
  });

  it("excludes items", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const quads = useQuadruples(except(rdfx.type, example.ns("tags")));
      const [first, second] = quads;

      return (
        <div>
          <div data-testid="len">{quads.length}</div>
          <div data-testid="subject_0">{first[QuadPosition.subject]?.value}</div>
          <div data-testid="predicate_0">{first[QuadPosition.predicate]?.value}</div>
          <div data-testid="object_0">{first[QuadPosition.object]?.value}</div>
          <div data-testid="subject_1">{second[QuadPosition.subject]?.value}</div>
          <div data-testid="predicate_1">{second[QuadPosition.predicate]?.value}</div>
          <div data-testid="object_1">{second[QuadPosition.object]?.value}</div>
        </div>
      );
    };

    const { getByTestId } = render(<UpdateComp />,  { wrapper: opts.wrapper });

    expect(getByTestId("len")!.textContent).toBe("12");
    expect(getByTestId("subject_0")!.textContent).toBe(opts.subject!.value);
    expect(getByTestId("predicate_0")!.textContent).toBe(schema.name.value);
    expect(getByTestId("object_0")!.textContent).toBe("title");
    expect(getByTestId("subject_1")!.textContent).toBe(opts.subject!.value);
    expect(getByTestId("predicate_1")!.textContent).toBe(schema.text.value);
    expect(getByTestId("object_1")!.textContent).toBe("text");
  });

  it("updates when data becomes available", async () => {
    const subject = rdfFactory.blankNode();
    const seq = rdfFactory.blankNode();
    const opts = ctx.type(subject);

    const UpdateComp = () => {
      const quads = useValues(array(schema.comment));
      const [first, second, third, fourth] = quads;

      return (
        <div>
          <div data-testid="len">{quads.length}</div>
          <div data-testid="e0">{first}</div>
          <div data-testid="e1">{second}</div>
          <div data-testid="e2">{third}</div>
          <div data-testid="e3">{fourth}</div>
        </div>
      );
    };

    const { getByTestId, rerender } = render(<UpdateComp />,  { wrapper: opts.wrapper });

    await waitFor(() => {
      expect(getByTestId("len")!.textContent).toBe("0");
    });

    act(() => {
      opts.lrs.processDelta([
        [subject, schema.comment, seq, ld.replace],
        [seq, rdfx.type, rdfx.Seq, ld.replace],
        [seq, rdfx.ns("_01"), rdfFactory.literal("e1"), ld.replace],
      ], true);
    });

    act(() => {
      opts.lrs.api.invalidate(subject);
      opts.lrs.store.removeResource(subject);
      opts.lrs.api.invalidate(seq);
      opts.lrs.store.removeResource(seq);
    });

    rerender(<UpdateComp />);

    expect(getByTestId("len")!.textContent).toBe("1");

    act(() => {
      opts.lrs.processDelta([
        [subject, schema.comment, seq, ld.replace],
        [seq, rdfx.type, rdfx.Seq, ld.replace],
        [seq, rdfx.ns("_01"), rdfFactory.literal("e1"), ld.replace],
        [seq, rdfx.ns("_02"), rdfFactory.literal("e2"), ld.replace],
        [seq, rdfx.ns("_03"), rdfFactory.literal("e3"), ld.replace],
        [seq, rdfx.ns("_04"), rdfFactory.literal("e4"), ld.replace],
      ], true);
    });

    expect(getByTestId("len")!.textContent).toBe("4");
    expect(getByTestId("e0")!.textContent).toBe("e1");
    expect(getByTestId("e1")!.textContent).toBe("e2");
    expect(getByTestId("e2")!.textContent).toBe("e3");
    expect(getByTestId("e3")!.textContent).toBe("e4");
  });
});
