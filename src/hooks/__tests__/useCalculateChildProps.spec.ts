import "../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";
import { mount } from "enzyme";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { useDataFetching } from "../useDataFetching";

describe("useDataFetching", () => {
    it("allows an empty subject", () => {
      const opts = ctx.fullCW();

      opts.lrs.queueEntity = jest.fn();
      const comp = () => {
        useDataFetching([]);

        return null;
      };

      mount(opts.wrapComponent(React.createElement(comp)));

      expect(opts.lrs.queueEntity).not.toHaveBeenCalledTimes(1);
    });

    it("sets an error for blank node subjects", () => {
      const opts = ctx.fullCW();

      const setError = jest.fn();
      const comp = () => {
          useDataFetching(rdfFactory.blankNode(), setError);

          return null;
      };

      mount(opts.wrapComponent(React.createElement(comp)));

      expect(setError).toHaveBeenCalledTimes(1);
    });

    it("uses lrs reporter if no override was given", () => {
      const opts = ctx.fullCW();

      opts.lrs.report = jest.fn();
      const comp = () => {
          useDataFetching(rdfFactory.blankNode());

          return null;
      };

      mount(opts.wrapComponent(React.createElement(comp)));

      expect(opts.lrs.report).toHaveBeenCalledTimes(1);
    });
});
