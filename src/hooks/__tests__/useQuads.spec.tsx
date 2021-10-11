import * as rdfx from "@ontologies/rdf";
import * as schema from "@ontologies/schema";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import { except, useQuads } from "../useParsedField";

describe("useQuads", () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container!);
    container = undefined;
  });

  it("retrieves all statements", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const quads = useQuads(except());
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

    expect(container!.querySelector("#len")!.textContent).toBe("11");
    expect(container!.querySelector("#subject_0")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#predicate_0")!.textContent).toBe(rdfx.type.value);
    expect(container!.querySelector("#object_0")!.textContent).toBe(schema.CreativeWork.value);
    expect(container!.querySelector("#subject_1")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#predicate_1")!.textContent).toBe(schema.name.value);
    expect(container!.querySelector("#object_1")!.textContent).toBe("title");
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

    expect(container!.querySelector("#len")!.textContent).toBe("6");
    expect(container!.querySelector("#subject_0")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#predicate_0")!.textContent).toBe(schema.name.value);
    expect(container!.querySelector("#object_0")!.textContent).toBe("title");
    expect(container!.querySelector("#subject_1")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#predicate_1")!.textContent).toBe(schema.text.value);
    expect(container!.querySelector("#object_1")!.textContent).toBe("text");
  });
});
