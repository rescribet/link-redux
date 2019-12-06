import "../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";
import { mount } from "enzyme";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { useDataFetching } from "../useDataFetching";

describe("useDataFetching", () => {
    it("sets an error for blank node subjects", () => {
        const opts = ctx.fullCW();

        const setError = jest.fn();
        const comp = () => {
            useDataFetching({ subject: rdfFactory.blankNode() }, 0, setError);

            return null;
        };

        mount(opts.wrapComponent(React.createElement(comp)));

        expect(setError).toHaveBeenCalledTimes(1);
    });
});
