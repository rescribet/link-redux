import "../../__tests__/useHashFactory";

import rdfFactory, { TermType } from "@ontologies/core";
import * as schema from "@ontologies/schema";
import { act, render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { RecordState } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import ll from "../../ontology/ll";
import { useValues } from "../useParsedField";
import { useTempClones } from "../useTempClones";

describe("useTempClones", () => {
  it("creates a clone of existing record", () => {
    const { subject, wrapper, lrs } = ctx.fullCW();
    const { result: { current } } = renderHook(() => useTempClones([subject!]), { wrapper });

    expect(lrs.collectRecord(subject!)![schema.name.value]).toBe(rdfFactory.literal("title"));

    expect(current[0].termType).toBe(TermType.BlankNode);
    const data = lrs.collectRecord(current[0])!;
    expect(data[schema.name.value]).toBe(rdfFactory.literal("title"));
    expect(data._id).toBe(current[0]);
    expect(data[ll.clonedFrom.value]).toBe(subject);
  });

  it("creates a clone of nonexistent record", () => {
    const { wrapper, lrs } = ctx.empty();
    const id = rdfFactory.blankNode();
    const { result: { current } } = renderHook(() => useTempClones([id]), { wrapper });

    expect(current[0].termType).toBe(TermType.BlankNode);
    const data = lrs.collectRecord(current[0])!;
    expect(Object.keys(data)).toEqual(["_id", ll.clonedFrom.value]);
  });

  it("updates a clone if it was first loaded after cloning", async () => {
    const { wrapper, lrs } = ctx.empty();
    const subject = example.ns("test");

    const Comp = () => {
      const clones = useTempClones([subject]);
      const [cloneName] = useValues(clones[0], schema.name);
      const [clonedFrom] = useValues(clones[0], ll.clonedFrom);

      return (
        <>
          <p data-testid="idType">
            {clones[0].termType}
          </p>
          <p data-testid="name">
            {cloneName}
          </p>
          <p data-testid="cloned">
            {clonedFrom}
          </p>
        </>
      );
    };

    expect(lrs.getState(subject.value).current).toBe(RecordState.Absent);
    const { getByTestId } = render(<Comp />, { wrapper });

    expect(lrs.getState(subject.value).current).toBe(RecordState.Absent);
    const idType = getByTestId("idType").textContent;
    expect(idType).toBe(TermType.BlankNode);
    let name = getByTestId("name").textContent;
    expect(name).toEqual("");
    let cloned = getByTestId("cloned").textContent;
    expect(cloned).toEqual(subject.value);

    await act(async () => {
      lrs.store.getInternalStore().store.setRecord(subject.value, {
        [schema.name.value]: rdfFactory.literal("title"),
      });
      await (lrs as any).broadcast(false, 0);
    });
    expect(lrs.getState(subject.value).current).toBe(RecordState.Present);

    name = getByTestId("name").textContent;
    expect(name).toEqual("title");
    cloned = getByTestId("cloned").textContent;
    expect(cloned).toEqual(subject.value);
  });
});
