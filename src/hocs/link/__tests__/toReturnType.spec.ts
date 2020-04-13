import "../../../__tests__/useHashFactory";

import rdf from "@ontologies/core";
import { xsdboolean } from "@ontologies/xsd";
import ex from "../../../ontology/ex";

import { ReturnType } from "../../../types";

import { toReturnType } from "../toReturnType";

describe("toReturnType", () => {
  describe("returnType Literal", () => {
    describe("boolean", () => {
      const testBool = (value: string, res: boolean) => {
        const parsed = toReturnType(
          ReturnType.Literal,
          rdf.quad(ex.ns(""), ex.ns(""), rdf.literal(value, xsdboolean)),
        );

        expect(parsed).toEqual(res);
      };

      it("parses true", () => {
        testBool("true", true);
      });

      it("parses 1", () => {
         testBool("1", true);
      });

      it("parses t", () => {
         testBool("t", true);
      });

      it("parses false", () => {
        testBool("false", false);
      });

      it("parses 0", () => {
         testBool("0", false);
      });

      it("parses f", () => {
         testBool("f", false);
      });
    });
  });
});
