import rdf from "@ontologies/core";
import { render } from "@testing-library/react";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { TopologyProvider } from "../../components/TopologyProvider";
import { useTopology } from "../useTopology";

describe("useProperty", () => {
  it("defaults", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const topology = useTopology();

      return (
        <div data-testid="id">
          {topology?.value}
        </div>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("id")).toHaveTextContent("http://purl.org/link-lib/defaultTopology");
  });

  it("inherits from context", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const topology = useTopology();

      return (
        <div data-testid="id">
          {topology?.value}
        </div>
      );
    };

    class Provider extends TopologyProvider {
      topology = rdf.namedNode("https://example.com/topology");
    }

    const { getByTestId } = render(opts.wrapComponent((
      <Provider>
        <UpdateComp />
      </Provider>
    )));

    expect(getByTestId("id")).toHaveTextContent("https://example.com/topology");
  });
});
