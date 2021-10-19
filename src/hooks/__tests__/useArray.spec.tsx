import * as rdfx from "@ontologies/rdf";
import * as schema from "@ontologies/schema";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import { array, except, useQuads, useValues } from "../useParsedField";

describe("array", () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container!);
    container = undefined;
  });

  it("maps sequence to values", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const quads = useValues(array(schema.comment));
      const [first, second, third, fourth] = quads;

      return (
        <div>
          <div id="len">{quads.length}</div>
          <div id="e0">{first}</div>
          <div id="e1">{second}</div>
          <div id="e2">{third}</div>
          <div id="e3">{fourth}</div>
        </div>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#len")!.textContent).toBe("4");
    expect(container!.querySelector("#e0")!.textContent).toBe("e1");
    expect(container!.querySelector("#e1")!.textContent).toBe("e2");
    expect(container!.querySelector("#e2")!.textContent).toBe("e3");
    expect(container!.querySelector("#e3")!.textContent).toBe("e4");
  });

  it("excludes items", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const quads = useQuads(except(rdfx.type, example.ns("tags")));
      const [first, second] = quads;

      return (
        <div>
          <div id="len">{quads.length}</div>
          <div id="subject_0">{first?.subject?.value}</div>
          <div id="predicate_0">{first?.predicate?.value}</div>
          <div id="object_0">{first?.object?.value}</div>
          <div id="subject_1">{second?.subject?.value}</div>
          <div id="predicate_1">{second?.predicate?.value}</div>
          <div id="object_1">{second?.object?.value}</div>
        </div>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#len")!.textContent).toBe("12");
    expect(container!.querySelector("#subject_0")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#predicate_0")!.textContent).toBe(schema.name.value);
    expect(container!.querySelector("#object_0")!.textContent).toBe("title");
    expect(container!.querySelector("#subject_1")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#predicate_1")!.textContent).toBe(schema.text.value);
    expect(container!.querySelector("#object_1")!.textContent).toBe("text");
  });
});
