import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { useStrings } from "../useParsedField";

describe("useStrings", () => {
  it("renders strings", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [name] = useStrings(schema.name);

      return (
        <div data-testid="id">
          {name}
        </div>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("id")).toHaveTextContent("title");
  });

  it("renders langstrings", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [text] = useStrings(schema.text);

      return (
        <div data-testid="id">
          {text}
        </div>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("id")).toHaveTextContent("text");
  });

  it("filters non-strings", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [dateCreated] = useStrings(schema.dateCreated);

      return (
        <div data-testid="id">
          {dateCreated}
        </div>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("id")).toHaveTextContent("");
  });
});
