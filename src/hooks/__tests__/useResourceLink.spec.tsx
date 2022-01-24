import rdf, { QuadPosition } from "@ontologies/core";
import * as schema from "@ontologies/schema";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import ex from "../../ontology/ex";
import example from "../../ontology/example";
import { ReturnType } from "../../types";
import { useResourceLink } from "../useResourceLink";

describe("useResourceLink", () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container!);
    container = undefined;
  });

  it("retrieves a property", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const props = useResourceLink(
        opts.subject,
        {
          creation: schema.dateCreated,
          name: {
            label: schema.name,
            returnType: ReturnType.Term,
          },
          read: {
            label: ex.ns("timesRead"),
            returnType: ReturnType.Literal,
          },
          taggings: {
            label: example.ns("tags"),
            returnType: ReturnType.AllStatements,
          },
          whatever: {
            label: schema.name,
            returnType: ReturnType.Value,
          },
        },
        { returnType: ReturnType.Statement },
      );

      return (
        <div>
          <p id="id0">{(props.read as number)?.toFixed(2)}</p>
          <p id="id1">{props.name?.termType}</p>
          <p id="id2">{props.creation?.[QuadPosition.subject].value}</p>
          <p id="id3">{props.taggings[0]?.[QuadPosition.object]?.value}</p>
          <p id="id4">{props.taggings[1]?.[QuadPosition.object]?.value}</p>
          <p id="id5">{props.whatever?.charAt(4)}</p>
          <p id="id6">{props.subject?.[QuadPosition.predicate].value}</p>
        </div>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#id0")!.textContent).toBe("5.00");
    expect(container!.querySelector("#id1")!.textContent).toBe("Literal");
    expect(container!.querySelector("#id2")!.textContent).toBe(opts.subject!.value);
    expect(container!.querySelector("#id3")!.textContent).toBe(example.ns("tag/0").value);
    expect(container!.querySelector("#id4")!.textContent).toBe(example.ns("tag/1").value);
    expect(container!.querySelector("#id5")!.textContent).toBe("e");
    expect(container!.querySelector("#id6")!.textContent).toBe("http://purl.org/link-lib/dataSubject");
  });

  it("returns empty object when resource doesn't exists", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const props = useResourceLink(
        rdf.blankNode("empty"),
        {
          creation: schema.dateCreated,
        },
      );

      return (
        <div>
          <p id="id0">{props.subject?.value}</p>
          <p id="id1">{Object.keys(props).length}</p>
        </div>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#id0")!.textContent).toBe("empty");
    expect(container!.querySelector("#id1")!.textContent).toBe("1");
  });

  it("returns empty object when subject is undefined", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const props = useResourceLink(
        undefined,
        {
          creation: schema.dateCreated,
        },
      );

      return (
        <div>
          <p id="id0">{props.subject?.value}</p>
          <p id="id1">{Object.keys(props).length}</p>
        </div>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#id0")!.textContent).toBe("");
    expect(container!.querySelector("#id1")!.textContent).toBe("1");
  });
});
