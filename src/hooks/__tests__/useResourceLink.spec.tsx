import schema from "@ontologies/schema";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import { Amount, ReturnType } from "../../types";
import { useResourceLink } from "../useResourceLink";

describe("useLink", () => {
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
          commentsCount: schema.commentCount,
          defaultSecond: {
            label: schema.name,
            limit: Amount.Some,
          },
          name: {
            label: schema.name,
            limit: 1,
            returnType: ReturnType.Term,
          },
          whatever: {
            label: schema.name,
            returnType: ReturnType.Value,
          },
        },
        { returnType: ReturnType.Statement },
      );

      return (
        <div id="test">
          {props.name?.termType.fixed()}   // Term
          {props.commentsCount?.graph}     // Default (Statement)
          {props.defaultSecond[0]?.predicate} // Default (Statement)
          {props.defaultSecond[1]?.predicate} // Default (Statement)
          {props.whatever?.charAt(4)}      // string
          {props.subject.predicate.value}  // Default (Statement)
        </div>
      );
    };

    act(() => {
      // @ts-ignore
      ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
    });

    expect(container!.querySelector("#test")!.textContent).toBe("title");
  });
});
