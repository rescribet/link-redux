import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { useProperty } from "../useProperty";

describe("useProperty", () => {
  it("returns the properties", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [name] = useProperty(schema.name);

      return (
        <div data-testid="id">
          {name.value}
        </div>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("id")).toHaveTextContent("title");
  });
});
