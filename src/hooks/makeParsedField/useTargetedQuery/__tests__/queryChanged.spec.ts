import { NamedNode } from "@ontologies/core";
import * as schema from "@ontologies/schema";
import { ArrayQuery, DigQuery, ExceptQuery, QueryType } from "../../types";

import { queryChanged } from "../queryChanged";

describe("queryChanged", () => {
  it("handles referential equality", () => {
    const obj: NamedNode[] = [];
    expect(queryChanged(obj, obj)).toBeFalsy();
  });

  it("handles undefined values", () => {
    expect(queryChanged(undefined, undefined)).toBeFalsy();
    expect(queryChanged(undefined, [])).toBeTruthy();
    expect(queryChanged([], undefined)).toBeTruthy();
  });

  it("handles arrays", () => {
    expect(queryChanged([schema.name], [])).toBeTruthy();
    expect(queryChanged([schema.name], schema.name)).toBeTruthy();
    expect(queryChanged([schema.name], [schema.name])).toBeFalsy();
    expect(queryChanged([schema.name], [schema.text])).toBeTruthy();
    expect(queryChanged([schema.name], [schema.name, schema.text])).toBeTruthy();
  });

  it("handles terms", () => {
    expect(queryChanged(schema.name, schema.name)).toBeFalsy();
    expect(queryChanged(schema.name, schema.text)).toBeTruthy();
    expect(queryChanged(schema.name, [])).toBeTruthy();
  });

  it("handles different types", () => {
    const emptyDig: DigQuery = {
      path: [],
      type: QueryType.Dig,
    };
    const emptyArray: ArrayQuery = {
      fields: [],
      type: QueryType.Array,
    };

    expect(queryChanged(emptyDig, emptyArray)).toBeTruthy();
  });

  it("handles dig queries", () => {
    const empty: DigQuery = {
      path: [],
      type: QueryType.Dig,
    };
    const singleNested: DigQuery = {
      path: [schema.name],
      type: QueryType.Dig,
    };
    const singleNestedTwo: DigQuery = {
      path: [schema.description],
      type: QueryType.Dig,
    };
    const multipleNested: DigQuery = {
      path: [schema.comment, [schema.text, schema.description]],
      type: QueryType.Dig,
    };
    const multipleNestedTwo: DigQuery = {
      path: [schema.comment, [schema.text, schema.text]],
      type: QueryType.Dig,
    };

    expect(queryChanged(empty, empty)).toBeFalsy();
    expect(queryChanged(singleNested, singleNested)).toBeFalsy();
    expect(queryChanged(multipleNested, multipleNested)).toBeFalsy();

    expect(queryChanged(empty, singleNested)).toBeTruthy();
    expect(queryChanged(empty, multipleNested)).toBeTruthy();
    expect(queryChanged(singleNested, empty)).toBeTruthy();
    expect(queryChanged(singleNested, singleNestedTwo)).toBeTruthy();
    expect(queryChanged(singleNested, multipleNested)).toBeTruthy();
    expect(queryChanged(multipleNested, empty)).toBeTruthy();
    expect(queryChanged(multipleNested, singleNested)).toBeTruthy();
    expect(queryChanged(multipleNested, multipleNestedTwo)).toBeTruthy();
  });

  it("handles array queries", () => {
    const empty: ArrayQuery = {
      fields: [],
      type: QueryType.Array,
    };
    const single: ArrayQuery = {
      fields: [schema.name],
      type: QueryType.Array,
    };
    const multiple: ArrayQuery = {
      fields: [schema.name, schema.description],
      type: QueryType.Array,
    };

    expect(queryChanged(empty, empty)).toBeFalsy();
    expect(queryChanged(empty, single)).toBeTruthy();
    expect(queryChanged(empty, multiple)).toBeTruthy();

    expect(queryChanged(single, single)).toBeFalsy();
    expect(queryChanged(single, empty)).toBeTruthy();
    expect(queryChanged(single, multiple)).toBeTruthy();

    expect(queryChanged(multiple, multiple)).toBeFalsy();
    expect(queryChanged(multiple, empty)).toBeTruthy();
    expect(queryChanged(multiple, single)).toBeTruthy();
  });

  it("handles except queries", () => {
    const empty: ExceptQuery = {
      fields: [],
      type: QueryType.Except,
    };
    const single: ExceptQuery = {
      fields: [schema.name],
      type: QueryType.Except,
    };
    const multiple: ExceptQuery = {
      fields: [schema.name, schema.description],
      type: QueryType.Except,
    };

    expect(queryChanged(empty, empty)).toBeFalsy();
    expect(queryChanged(empty, single)).toBeTruthy();
    expect(queryChanged(empty, multiple)).toBeTruthy();

    expect(queryChanged(single, single)).toBeFalsy();
    expect(queryChanged(single, empty)).toBeTruthy();
    expect(queryChanged(single, multiple)).toBeTruthy();

    expect(queryChanged(multiple, multiple)).toBeFalsy();
    expect(queryChanged(multiple, empty)).toBeTruthy();
    expect(queryChanged(multiple, single)).toBeTruthy();
  });
});
