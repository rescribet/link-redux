import "../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";

import { hasChanged } from "../useCalculatedValue";

describe("useCalculatedValue", () => {
    describe("hasChanged", () => {
      it("handles undefined", () => {
        expect(hasChanged(undefined, undefined)).toBeFalsy();
      });

      it("handles equal array", () => {
        const id = rdfFactory.blankNode();
        expect(hasChanged([id], [id])).toBeFalsy();
      });

      it("handles unequal array", () => {
        expect(hasChanged([rdfFactory.blankNode()], [rdfFactory.blankNode()])).toBeTruthy();
      });

      it("handles long equal array", () => {
        const id1 = rdfFactory.blankNode();
        const id2 = rdfFactory.blankNode();
        const id3 = rdfFactory.blankNode();
        expect(hasChanged([id1, id2, id3], [id1, id2, id3])).toBeFalsy();
      });

      it("handles long unequal array", () => {
        const id1 = rdfFactory.blankNode();
        const id2 = rdfFactory.blankNode();
        const id3 = rdfFactory.blankNode();
        expect(hasChanged([id1, id2, id3], [id2, id1, id3])).toBeTruthy();
      });

      it("handles unequal types", () => {
        const id1 = rdfFactory.blankNode();
        const id2 = rdfFactory.blankNode();
        const id3 = rdfFactory.blankNode();
        expect(hasChanged(id1, [id1, id2, id3])).toBeTruthy();
      });
    });
});
