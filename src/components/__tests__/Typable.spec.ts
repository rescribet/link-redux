import "../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";
import { mount } from "enzyme";
import { defaultNS } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { register } from "../../register";
import {
    errorComponent,
    loadingComponent,
    renderError,
    renderNoView,
} from "../Typable";

describe("Typable", () => {
    const props = {
        subject: rdfFactory.blankNode(),
        topology: defaultNS.ex("t"),
    };

    describe("renderNoView", () => {
        it("renders a registered no-view component", () => {
            const opts = ctx.empty();
            const errorComp = () => React.createElement("span", { className: "custom-no-view" });
            errorComp.type = defaultNS.ll("NoView");
            errorComp.topology = defaultNS.ex("t");
            opts.lrs.registerAll(register(errorComp));
            const element = renderNoView(props, opts.lrs);

            const tree = mount(element);

            expect(tree).toContainMatchingElement(".custom-no-view");
        });
    });

    describe("renderError", () => {
        it("returns null without any error component", () => {
            const element = renderError(props, ctx.empty().lrs);

            expect(element).toBeNull();
        });

        it("renders the passed error component", () => {
            const opts = ctx.empty();
            const errorComp = () => React.createElement("span", { className: "error-comp" });
            const element = renderError({
                onError: errorComp,
                subject: rdfFactory.blankNode(),
                topology: defaultNS.ex("t"),
            }, opts.lrs);

            if (element === null) {
                throw new Error();
            }

            const tree = mount(element);

            expect(tree).toContainMatchingElement(".error-comp");
        });
    });

    describe("errorComponent", () => {
        it("returns null without onError and registered resource", () => {
            expect(errorComponent(props, ctx.empty().lrs)).toBeNull();
        });
    });

    describe("loadingComponent", () => {
        it("returns null without onError and registered resource", () => {
            expect(loadingComponent(props, ctx.empty().lrs)).toBeNull();
        });
    });
});
