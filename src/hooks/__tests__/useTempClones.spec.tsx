import "../../__tests__/useHashFactory";

import rdfFactory, { TermType } from "@ontologies/core";
import * as schema from "@ontologies/schema";
import { renderHook } from "@testing-library/react-hooks";

import * as ctx from "../../__tests__/helpers/fixtures";
import ll from "../../ontology/ll";
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
    const { result: { current } } = renderHook(() => useTempClones([rdfFactory.blankNode()]), { wrapper });

    expect(current[0].termType).toBe(TermType.BlankNode);
    const data = lrs.collectRecord(current[0])!;
    expect(Object.keys(data)).toEqual(["_id", ll.clonedFrom.value]);
  });
});
