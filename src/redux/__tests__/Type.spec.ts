/* eslint no-magic-numbers: 0 */
import { mount, shallow } from "enzyme";
import { defaultNS, LinkedRenderStore } from "link-lib";
import { createElement, ReactType } from "react";

import * as ctx from "../../../test/fixtures";
import { Type } from "../Type";

function createComponent(className: string): ReactType {
    return () => createElement("span", { className });
}

describe("Type component", () => {
    it("renders null when type is not present", () => {
        const opts = ctx.empty();

        const elem = shallow(opts.wrapComponent(createElement(Type)));

        expect(elem.find("span")).not.toBePresent();
    });

    it("renders no view when no class matches", () => {
        const opts = ctx.empty(undefined);

        const elem = mount(opts.wrapComponent(createElement(Type)));

        expect(elem.find("div.no-view")).toBePresent();
    });

    it("renders default when set", () => {
        const opts = ctx.type(undefined);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createComponent("thing"),
            defaultNS.schema("Thing"),
        ));

        const elem = mount(opts.wrapComponent(createElement(Type)));

        expect(elem.find("span")).toHaveClassName("thing");
    });

    it("renders the registered class", () => {
        const opts = ctx.fullCW();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createComponent("creativeWork"),
            defaultNS.schema("CreativeWork"),
        ));

        const elem = mount(opts.wrapComponent(createElement(Type)));

        expect(elem.find(".creativeWork")).toBePresent();
    });
});
