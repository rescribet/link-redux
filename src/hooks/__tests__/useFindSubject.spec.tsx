import rdfFactory from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { useFindSubject } from "../useFindSubject";

describe("useFindSubject", () => {
  it("finds a subject", () => {
    const opts = ctx.fullCW();

    const UpdateComp = () => {
      const [subject] = useFindSubject([schema.reviews, rdfx.rest, rdfx.rest, rdfx.first], rdfFactory.literal("r2"));

      return (
        <div data-testid="id">
          {subject.value}
        </div>
      );
    };

    const { getByTestId } = render(opts.wrapComponent(<UpdateComp />));

    expect(getByTestId("id")).toHaveTextContent("reviews2");
  });
});
