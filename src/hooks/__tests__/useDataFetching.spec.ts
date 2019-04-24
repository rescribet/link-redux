import { mount } from "enzyme";
import { BlankNode } from "rdflib";
import { createElement } from "react";

import * as ctx from "../../../test/fixtures";
import { useDataFetching } from "../useDataFetching";

describe("useDataFetching", () => {
    it("sets an error for blank node subjects", () => {
        const opts = ctx.fullCW();

        const setError = jest.fn();
        const comp = () => {
            useDataFetching({ subject: new BlankNode() }, 0, setError);

            return null;
        };

        mount(opts.wrapComponent(createElement(comp)));

        expect(setError).toHaveBeenCalledTimes(1);
    });
});
