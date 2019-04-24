import { mount } from "enzyme";
import { defaultNS } from "link-lib";
import { BlankNode } from "rdflib";
import { createElement } from "react";

import * as ctx from "../../../test/fixtures";
import { register } from "../../register";
import {
    errorComponent,
    loadingComponent,
    renderError,
    renderNoView,
} from "../Typable";

describe("Typable", () => {
    describe("renderNoView", () => {
        it("renders a registered no-view component", () => {
            const opts = ctx.empty();
            const errorComp = () => createElement("span", { className: "custom-no-view" });
            errorComp.type = defaultNS.ll("NoView");
            errorComp.topology = defaultNS.ex("t");
            opts.lrs.registerAll(register(errorComp));
            const element = renderNoView({
                subject: new BlankNode(),
                topology: defaultNS.ex("t"),
            }, opts.lrs);

            const tree = mount(element);

            expect(tree).toContainMatchingElement(".custom-no-view");
        });
    });

    describe("renderError", () => {
        it("returns null without any error component", () => {
            const opts = ctx.empty();

            const element = renderError({
                subject: new BlankNode(),
                topology: defaultNS.ex("t"),
            }, opts.lrs);

            expect(element).toBeNull();
        });

        it("renders the passed error component", () => {
            const opts = ctx.empty();
            const errorComp = () => createElement("span", { className: "error-comp" });
            const element = renderError({
                onError: errorComp,
                subject: new BlankNode(),
                topology: defaultNS.ex("t"),
            }, opts.lrs);

            const tree = mount(element);

            expect(tree).toContainMatchingElement(".error-comp");
        });
    });

    describe("errorComponent", () => {
        it("returns null without onError and registered resource", () => {
            const opts = ctx.empty();
            const resolved = errorComponent({
                subject: new BlankNode(),
                topology: defaultNS.ex("t"),
            }, opts.lrs);

            expect(resolved).toBeNull();
        });
    });

    describe("loadingComponent", () => {
        it("returns null without onError and registered resource", () => {
            const opts = ctx.empty();
            const resolved = loadingComponent({
                subject: new BlankNode(),
                topology: defaultNS.ex("t"),
            }, opts.lrs);

            expect(resolved).toBeNull();
        });
    });
});
