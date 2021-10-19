import rdfFactory, { Quad } from "@ontologies/core";
import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import React from "react";
import * as util from "util";
import {
  alt2BooleanLiteral, altBooleanLiteral,
  b64Literal, badUrl,
  bigIntLiteral,
  booleanLiteral,
  dateLiteral,
  doubleLiteral, falseBooleanLiteral,
  globalId,
  integerLiteral,
  langStringLiteral,
  localId, nanIntegerLiteral,
  stringLiteral,
} from "../../__tests__/helpers/fixtures";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import { makeParsedField } from "../makeParsedField";
import {
  array,
  dig,
  useAnyStrings,
  useBase64s,
  useBigInts,
  useBooleans,
  useDates,
  useFields,
  useGlobalIds,
  useIds,
  useLangStrings,
  useLiterals,
  useLiteralValues,
  useLocalIds,
  useNumbers,
  useQuads,
  useRegularStrings,
  useStrings,
  useUrls,
  useValues,
} from "../useParsedField";

describe("useParsedField", () => {
  describe("makeParsedField", () => {
    it("filters on predicate", () => {
      const parser = jest.fn((v: Quad) => {
        return v;
      });
      const parserWrapper = jest.fn(() => parser);
      const useParsedField = makeParsedField(parserWrapper);

      const FieldComp = () => {
        const fields = useParsedField(schema.name);
        const [q1] = fields;

        return (
          <div>
            <div data-testid="len">{fields.length}</div>
            <div data-testid="s">{q1?.subject?.value}</div>
            <div data-testid="p">{q1?.predicate?.value}</div>
            <div data-testid="ott">{q1?.object?.termType}</div>
            <div data-testid="ov">{q1?.object?.value}</div>
          </div>
        );
      };

      const opts = ctx.fullCW();
      const { getByTestId } = render(opts.wrapComponent(<FieldComp />));

      expect(parserWrapper).toHaveBeenCalledTimes(1);
      expect(parserWrapper).toHaveBeenCalledWith(opts.lrs);
      expect(parser).toHaveBeenCalledTimes(1);
      expect(getByTestId("len")!.textContent).toBe("1");
      expect(getByTestId("p")!.textContent).toBe("http://schema.org/name");
      expect(getByTestId("ott")!.textContent).toBe("Literal");
      expect(getByTestId("ov")!.textContent).toBe("title");
    });

    it("allows overriding resource", () => {
      const secondId = example.ns("second");
      const opts = ctx.multipleCW(
        example.ns("3"),
        {
          second: {
            id: secondId,
            title: "Second title",
          },
        },
      );

      const parser = jest.fn((v: Quad) => v);
      const parserWrapper = jest.fn(() => parser);
      const useParsedField = makeParsedField(parserWrapper);

      const FieldComp = () => {
        const fields = useParsedField(secondId, schema.name);
        const [q1] = fields;

        return (
          <div>
            <div data-testid="len">{fields.length}</div>
            <div data-testid="s">{q1?.subject?.value}</div>
            <div data-testid="p">{q1?.predicate?.value}</div>
            <div data-testid="ott">{q1?.object?.termType}</div>
            <div data-testid="ov">{q1?.object?.value}</div>
          </div>
        );
      };

      const { getByTestId } = render(opts.wrapComponent(<FieldComp />));

      expect(parserWrapper).toHaveBeenCalledTimes(1);
      expect(parserWrapper).toHaveBeenCalledWith(opts.lrs);
      // expect(parser).toHaveBeenCalledTimes(1);
      expect(getByTestId("len")!.textContent).toBe("1");
      expect(getByTestId("p")!.textContent).toBe("http://schema.org/name");
      expect(getByTestId("ott")!.textContent).toBe("Literal");
      expect(getByTestId("ov")!.textContent).toBe("Second title");
    });

    it("does not use context subject if target is passed", () => {
      const secondId = example.ns("second");
      const opts = ctx.multipleCW(
        example.ns("3"),
        {
          second: {
            id: secondId,
            title: "Second title",
          },
        },
      );

      const parser = jest.fn((v: Quad) => v);
      const parserWrapper = jest.fn(() => parser);
      const useParsedField = makeParsedField(parserWrapper);

      const FieldComp = () => {
        const fields = useParsedField(undefined, schema.name);

        return (
          <div>
            <div data-testid="len">{fields.length}</div>
          </div>
        );
      };

      const { getByTestId } = render(opts.wrapComponent(<FieldComp />));

      expect(parserWrapper).toHaveBeenCalledTimes(0);
      expect(parser).toHaveBeenCalledTimes(0);
      expect(getByTestId("len")!.textContent).toBe("0");
    });

    it("allows passing multiple resources", () => {
      const firstId = example.ns("3");
      const secondId = example.ns("second");
      const opts = ctx.multipleCW(
        firstId,
        {
          second: {
            id: secondId,
            title: "Second title",
          },
        },
      );

      const parser = jest.fn((v: Quad) => v);
      const parserWrapper = jest.fn(() => parser);
      const useParsedField = makeParsedField(parserWrapper);

      const FieldComp = () => {
        const fieldSets = useParsedField([firstId, secondId], schema.name);
        const [fields0, fields1] = fieldSets;
        const [q0] = fields0;
        const [q1] = fields1;

        return (
          <div>
            <div data-testid="lenS">{fieldSets.length}</div>

            <div data-testid="len0">{fields0.length}</div>
            <div data-testid="s0">{q0?.subject?.value}</div>
            <div data-testid="p0">{q0?.predicate?.value}</div>
            <div data-testid="ott0">{q0?.object?.termType}</div>
            <div data-testid="ov0">{q0?.object?.value}</div>

            <div data-testid="len1">{fields1.length}</div>
            <div data-testid="s1">{q1?.subject?.value}</div>
            <div data-testid="p1">{q1?.predicate?.value}</div>
            <div data-testid="ott1">{q1?.object?.termType}</div>
            <div data-testid="ov1">{q1?.object?.value}</div>
          </div>
        );
      };

      const { getByTestId } = render(opts.wrapComponent(<FieldComp />));

      expect(parserWrapper).toHaveBeenCalledTimes(1);
      expect(parserWrapper).toHaveBeenCalledWith(opts.lrs);
      expect(parser).toHaveBeenCalledTimes(2);

      expect(getByTestId("lenS")!.textContent).toBe("2");

      expect(getByTestId("len0")!.textContent).toBe("1");
      expect(getByTestId("p0")!.textContent).toBe("http://schema.org/name");
      expect(getByTestId("ott0")!.textContent).toBe("Literal");
      expect(getByTestId("ov0")!.textContent).toBe("title");

      expect(getByTestId("len1")!.textContent).toBe("1");
      expect(getByTestId("p1")!.textContent).toBe("http://schema.org/name");
      expect(getByTestId("ott1")!.textContent).toBe("Literal");
      expect(getByTestId("ov1")!.textContent).toBe("Second title");
    });

    it("handles null case", () => {
      const parser = jest.fn((v: Quad) => v);
      const parserWrapper = jest.fn(() => parser);
      const useParsedField = makeParsedField(parserWrapper);

      const FieldComp = () => {
        const fields = useParsedField(schema.acceptedAnswer);

        return <div data-testid="len">{fields.length}</div>;
      };

      const opts = ctx.fullCW();
      const { getByTestId } = render(opts.wrapComponent(<FieldComp />));

      expect(parser).toHaveBeenCalledTimes(0);
      expect(getByTestId("len")!.textContent).toBe("0");
    });

    it("handles empty array case", () => {
      const parser = jest.fn((v: Quad) => v);
      const parserWrapper = jest.fn(() => parser);

      const { wrapper } = ctx.fullCW();
      const useHook = makeParsedField(parserWrapper);
      const { result: { current } } = renderHook(() => useHook([], []), { wrapper });

      expect(parser).toHaveBeenCalledTimes(0);
      expect(current).toEqual([]);
    });
  });

  describe("queries", () => {
    describe("dig", () => {
      it("resolves through associations", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(
          () => useValues(dig(schema.accountablePerson, schema.name)),
          { wrapper },
        );

        expect(current).toEqual(["Roy"]);
      });
    });

    describe("array", () => {
      it("returns empty array without target", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(() => useValues(undefined, array(schema.comment)), { wrapper });

        expect(current).toEqual([]);
      });

      it("returns empty array with empty target", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(() => useValues([undefined], array(schema.comment)), { wrapper });

        expect(current).toEqual([[]]);
      });

      it("unpacks Seq", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(() => useValues(array(schema.comment)), { wrapper });

        expect(current).toEqual(["e1", "e2", "e3", "e4"]);
      });

      it("skips non-nodes", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(
          () => useValues(array(schema.isSimilarTo)),
          { wrapper },
        );

        expect(current).toEqual([]);
      });

      it("unpacks List", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(() => useValues(array(schema.reviews)), { wrapper });

        expect(current).toEqual(["r0", "r1", "r2", "r3", "r4"]);
      });

      it("unpacks broken List", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(() => useValues(array(example.ns("broken"))), { wrapper });

        expect(current).toEqual(["b0", "b1"]);
      });

      it("unpacks endless List", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(() => useValues(array(example.ns("endless"))), { wrapper });

        expect(current).toEqual(["e0", "e1"]);
      });

      it("unpacks circular List", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(() => useValues(array(example.ns("circular"))), { wrapper });

        expect(current).toEqual(["c0", "c1"]);
      });
    });
  });

  describe("variants", () => {
      const prop = example.ns("prop");
      const id = example.ns("3");
      const opts = ctx.allTypesProp(id, prop);
      const wrapper = opts.wrapper;

      const quads = [
        rdfFactory.quad(id, prop, langStringLiteral),
        rdfFactory.quad(id, prop, globalId),
        rdfFactory.quad(id, prop, badUrl),
        rdfFactory.quad(id, prop, localId),
        rdfFactory.quad(id, prop, b64Literal),
        rdfFactory.quad(id, prop, bigIntLiteral),
        rdfFactory.quad(id, prop, booleanLiteral),
        rdfFactory.quad(id, prop, falseBooleanLiteral),
        rdfFactory.quad(id, prop, altBooleanLiteral),
        rdfFactory.quad(id, prop, alt2BooleanLiteral),
        rdfFactory.quad(id, prop, dateLiteral),
        rdfFactory.quad(id, prop, stringLiteral),
        rdfFactory.quad(id, prop, integerLiteral),
        rdfFactory.quad(id, prop, nanIntegerLiteral),
        rdfFactory.quad(id, prop, doubleLiteral),
      ];
      const allLiterals = [
        langStringLiteral,
        b64Literal,
        bigIntLiteral,
        booleanLiteral,
        falseBooleanLiteral,
        altBooleanLiteral,
        alt2BooleanLiteral,
        dateLiteral,
        stringLiteral,
        integerLiteral,
        nanIntegerLiteral,
        doubleLiteral,
      ];

      describe("useQuads", () => {
        const result = quads;

        it("returns a parsed value", () => {
          const value = renderHook(() => useQuads(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useFields", () => {
        const result = quads.map((q) => q.object);

        it("returns a parsed value", () => {
          const value = renderHook(() => useFields(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useIds", () => {
        const result = [globalId, badUrl, localId];

        it("returns a parsed value", () => {
          const value = renderHook(() => useIds(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useGlobalIds", () => {
        const result = [globalId, badUrl];

        it("returns a parsed value", () => {
          const value = renderHook(() => useGlobalIds(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useLocalIds", () => {
        const result = [localId];

        it("returns a parsed value", () => {
          const value = renderHook(() => useLocalIds(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useLiterals", () => {
        const result = allLiterals;

        it("returns a parsed value", () => {
          const value = renderHook(() => useLiterals(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useValues", () => {
        const result = quads.map((q) => q.object.value);

        it("returns a parsed value", () => {
          const value = renderHook(() => useValues(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useLiteralValues", () => {
        const result = allLiterals.map((t) => t.value);

        it("returns a parsed value", () => {
          const value = renderHook(() => useLiteralValues(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useBase64s", () => {
        const result = "A";

        it("returns a parsed value", () => {
          const value = renderHook(() => useBase64s(prop), { wrapper });

          expect(new util.TextDecoder().decode(value.result.current[0])).toEqual(result);
        });
      });

      describe("useBigInts", () => {
        const result = [BigInt(bigIntLiteral.value)];

        it("returns a parsed value", () => {
          const value = renderHook(() => useBigInts(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useBooleans", () => {
        const result = [true, false, true, true];

        it("returns a parsed value", () => {
          const value = renderHook(() => useBooleans(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useDates", () => {
        const result = [new Date(dateLiteral.value)];

        it("returns a parsed value", () => {
          const value = renderHook(() => useDates(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useAnyStrings", () => {
        const result = [
          [langStringLiteral.value, langStringLiteral.language],
          [stringLiteral.value, undefined],
        ];

        it("returns a parsed value", () => {
          const value = renderHook(() => useAnyStrings(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useLangStrings", () => {
        const result = [[langStringLiteral.value, langStringLiteral.language]];

        it("returns a parsed value", () => {
          const value = renderHook(() => useLangStrings(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useRegularStrings", () => {
        const result = [stringLiteral.value];

        it("returns a parsed value", () => {
          const value = renderHook(() => useRegularStrings(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useStrings", () => {
        const result = [langStringLiteral.value, stringLiteral.value];

        it("returns a parsed value", () => {
          const value = renderHook(() => useStrings(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useNumbers", () => {
        const result = [5, 6.7];

        it("returns a parsed value", () => {
          const value = renderHook(() => useNumbers(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

      describe("useUrls", () => {
        const result = [new URL(globalId.value)];

        it("returns a parsed value", () => {
          const value = renderHook(() => useUrls(prop), { wrapper });

          expect(value.result.current).toEqual(result);
        });
      });

    });
});
