import { Quad } from "@ontologies/core";
import * as schema from "@ontologies/schema";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";

import { makeParsedField } from "../useParsedField";

describe("useParsedField", () => {
  describe("makeParsedField", () => {
    let container: HTMLElement | undefined;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container!);
      container = undefined;
    });

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
            <div id="len">{fields.length}</div>
            <div id="s">{q1?.subject?.value}</div>
            <div id="p">{q1?.predicate?.value}</div>
            <div id="ott">{q1?.object?.termType}</div>
            <div id="ov">{q1?.object?.value}</div>
          </div>
        );
      };

      const opts = ctx.fullCW();
      const test = opts.wrapComponent(<FieldComp />);
      // @ts-ignore
      ReactDOM.render(test, container);

      expect(parserWrapper).toHaveBeenCalledTimes(1);
      expect(parserWrapper).toHaveBeenCalledWith(opts.lrs);
      expect(parser).toHaveBeenCalledTimes(1);
      expect(container!.querySelector("#len")!.textContent).toBe("1");
      expect(container!.querySelector("#p")!.textContent).toBe("http://schema.org/name");
      expect(container!.querySelector("#ott")!.textContent).toBe("Literal");
      expect(container!.querySelector("#ov")!.textContent).toBe("title");
    });

    it("Allows overriding resource", () => {
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
        const fields = useParsedField(schema.name, secondId);
        const [q1] = fields;

        return (
          <div>
            <div id="len">{fields.length}</div>
            <div id="s">{q1?.subject?.value}</div>
            <div id="p">{q1?.predicate?.value}</div>
            <div id="ott">{q1?.object?.termType}</div>
            <div id="ov">{q1?.object?.value}</div>
          </div>
        );
      };

      act(() => {
        // @ts-ignore
        ReactDOM.render(opts.wrapComponent(<FieldComp />), container);
      });

      expect(parserWrapper).toHaveBeenCalledTimes(1);
      expect(parserWrapper).toHaveBeenCalledWith(opts.lrs);
      expect(parser).toHaveBeenCalledTimes(1);
      expect(container!.querySelector("#len")!.textContent).toBe("1");
      expect(container!.querySelector("#p")!.textContent).toBe("http://schema.org/name");
      expect(container!.querySelector("#ott")!.textContent).toBe("Literal");
      expect(container!.querySelector("#ov")!.textContent).toBe("Second title");
    });

    it("Does not use context subject if second argument is given", () => {
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
        const fields = useParsedField(schema.name, undefined);

        return (
          <div>
            <div id="len">{fields.length}</div>
          </div>
        );
      };

      act(() => {
        // @ts-ignore
        ReactDOM.render(opts.wrapComponent(<FieldComp />), container);
      });

      expect(parserWrapper).toHaveBeenCalledTimes(0);
      expect(parser).toHaveBeenCalledTimes(0);
      expect(container!.querySelector("#len")!.textContent).toBe("0");
    });

    it("Allows passing multiple resources", () => {
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
        const fieldSets = useParsedField(schema.name, [firstId, secondId]);
        const [fields0, fields1] = fieldSets;
        const [q0] = fields0;
        const [q1] = fields1;

        return (
          <div>
            <div id="lenS">{fieldSets.length}</div>

            <div id="len0">{fields0.length}</div>
            <div id="s0">{q0?.subject?.value}</div>
            <div id="p0">{q0?.predicate?.value}</div>
            <div id="ott0">{q0?.object?.termType}</div>
            <div id="ov0">{q0?.object?.value}</div>

            <div id="len1">{fields1.length}</div>
            <div id="s1">{q1?.subject?.value}</div>
            <div id="p1">{q1?.predicate?.value}</div>
            <div id="ott1">{q1?.object?.termType}</div>
            <div id="ov1">{q1?.object?.value}</div>
          </div>
        );
      };

      act(() => {
        // @ts-ignore
        ReactDOM.render(opts.wrapComponent(<FieldComp />), container);
      });

      expect(parserWrapper).toHaveBeenCalledTimes(1);
      expect(parserWrapper).toHaveBeenCalledWith(opts.lrs);
      expect(parser).toHaveBeenCalledTimes(2);

      expect(container!.querySelector("#lenS")!.textContent).toBe("2");

      expect(container!.querySelector("#len0")!.textContent).toBe("1");
      expect(container!.querySelector("#p0")!.textContent).toBe("http://schema.org/name");
      expect(container!.querySelector("#ott0")!.textContent).toBe("Literal");
      expect(container!.querySelector("#ov0")!.textContent).toBe("title");

      expect(container!.querySelector("#len1")!.textContent).toBe("1");
      expect(container!.querySelector("#p1")!.textContent).toBe("http://schema.org/name");
      expect(container!.querySelector("#ott1")!.textContent).toBe("Literal");
      expect(container!.querySelector("#ov1")!.textContent).toBe("Second title");
    });

    it("handles null case", () => {
      const parser = jest.fn((v: Quad) => v);
      const parserWrapper = jest.fn(() => parser);
      const useParsedField = makeParsedField(parserWrapper);

      const FieldComp = () => {
        const fields = useParsedField(schema.acceptedAnswer);

        return <div id="len">{fields.length}</div>;
      };

      act(() => {
        const opts = ctx.fullCW();
        // @ts-ignore
        ReactDOM.render(opts.wrapComponent(<FieldComp />), container);
      });

      expect(parser).toHaveBeenCalledTimes(0);
      expect(container!.querySelector("#len")!.textContent).toBe("0");
    });
  });
});
