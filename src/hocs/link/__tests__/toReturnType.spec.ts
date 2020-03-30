import "../../../__tests__/useHashFactory";

import rdf from "@ontologies/core";
import { xsdboolean } from "@ontologies/xsd";
import ex from "../../../ontology/ex";

import { ReturnType } from "../../../types";

import { toReturnType } from "../toReturnType";

describe("toReturnType", () => {
  describe("returnType Literal", () => {
    it("parses true boolean value", () => {
        const value = toReturnType(
          ReturnType.Literal,
          rdf.quad(ex.ns(""), ex.ns(""), rdf.literal("true", xsdboolean)),
        );

        expect(value).toEqual(true);
    });

    it("parses 1 boolean value", () => {
        const value = toReturnType(
          ReturnType.Literal,
          rdf.quad(ex.ns(""), ex.ns(""), rdf.literal("1", xsdboolean)),
        );

        expect(value).toEqual(true);
    });

    it("parses t boolean value", () => {
        const value = toReturnType(
          ReturnType.Literal,
          rdf.quad(ex.ns(""), ex.ns(""), rdf.literal("t", xsdboolean)),
        );

        expect(value).toEqual(true);
    });
  });
});
