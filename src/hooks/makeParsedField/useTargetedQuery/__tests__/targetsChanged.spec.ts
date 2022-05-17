import { NamedNode } from "@ontologies/core";
import * as schema from "@ontologies/schema";

import { targetsChanged } from "../targetsChanged";

describe("targetsChanged", () => {
  it("handles referential equality", () => {
    const obj: NamedNode[] = [];
    expect(targetsChanged(obj, obj)).toBeFalsy();
  });

  it("handles equal nodes", () => {
    expect(targetsChanged(schema.name, schema.name)).toBeFalsy();
  });

  it("handles unequal nodes", () => {
    expect(targetsChanged(schema.name, schema.text)).toBeTruthy();
  });

  it("handles undefined values", () => {
    expect(targetsChanged(undefined, undefined)).toBeFalsy();
    expect(targetsChanged(undefined, [])).toBeTruthy();
    expect(targetsChanged([], undefined)).toBeTruthy();
  });

  it("handles arrays", () => {
    expect(targetsChanged([schema.name], [schema.name])).toBeFalsy();
    expect(targetsChanged([], [schema.name])).toBeTruthy();
    expect(targetsChanged([schema.name], [])).toBeTruthy();
    expect(targetsChanged([schema.name], schema.name)).toBeTruthy();
    expect(targetsChanged(schema.name, [schema.name])).toBeTruthy();
    expect(targetsChanged([schema.name], [schema.text])).toBeTruthy();
    expect(targetsChanged([schema.name], [schema.name, schema.text])).toBeTruthy();
    expect(targetsChanged([schema.name, schema.text], [schema.name])).toBeTruthy();
  });
});
