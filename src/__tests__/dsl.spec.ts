import schema from "@ontologies/schema";

import {
  all,
  dereference,
  hold,
  literal,
  literals,
  renderAlways,
  renderPartial,
  single,
  some,
  statement,
  statements,
  term,
  terms,
  value,
  values,
} from "../dsl";
import { ReturnType } from "../types";

describe("DSL", () => {
  describe("mergedMap", () => {
    it("sets the label", () => {
      expect(all(schema.name)).toHaveProperty("label", schema.name);
    });

    it("sets an array of labels", () => {
      const labels = [schema.name, schema.text];
      expect(all(labels)).toHaveProperty("label", labels);
    });

    it("keeps property maps", () => {
      const map = {
        custom: true,
        label: schema.name,
      };
      expect(all(map)).toHaveProperty("custom", true);
      expect(all(map)).toHaveProperty("label", schema.name);
      expect(all(map)).toHaveProperty("limit", Infinity);
    });
  });

  describe("limit", () => {
    it("has all option", () => {
      expect(all(schema.name)).toHaveProperty("limit", Infinity);
    });

    describe("some", () => {
      it("defaults to 10", () => {
        expect(some(schema.name)).toHaveProperty("limit", 10);
      });

      it("allows custom limit", () => {
        expect(some(schema.name, 100)).toHaveProperty("limit", 100);
      });
    });

    it("has single option", () => {
      expect(single(schema.name)).toEqual({
        label: schema.name,
        limit: 1,
      });
    });
  });

  describe("return types", () => {
    it("sets Term", () => expect(term(schema.name))
      .toHaveProperty("returnType"), ReturnType.Term);
    it("sets Statement", () => expect(statement(schema.name))
      .toHaveProperty("returnType"), ReturnType.Statement);
    it("sets Literal", () => expect(literal(schema.name))
      .toHaveProperty("returnType"), ReturnType.Literal);
    it("sets Value", () => expect(value(schema.name))
      .toHaveProperty("returnType"), ReturnType.Value);
    it("sets AllTerms", () => expect(terms(schema.name))
      .toHaveProperty("returnType"), ReturnType.AllTerms);
    it("sets AllStatements", () => expect(statements(schema.name))
      .toHaveProperty("returnType"), ReturnType.AllStatements);
    it("sets AllLiterals", () => expect(literals(schema.name))
      .toHaveProperty("returnType"), ReturnType.AllLiterals);
    it("sets AllValues", () => expect(values(schema.name))
      .toHaveProperty("returnType"), ReturnType.AllValues);
  });

  describe("data fetching", () => {
    it("has dereference", () => expect(dereference(schema.name))
      .toHaveProperty("fetch", true));
    it("has hold", () => expect(hold(schema.name))
      .toHaveProperty("fetch", false));
  });

  describe("rendering", () => {
    it("has force", () => expect(renderAlways(schema.name))
      .toHaveProperty("forceRender", true));
    it("has partial", () => expect(renderPartial(schema.name))
      .toHaveProperty("forceRender", false));
  });
});
