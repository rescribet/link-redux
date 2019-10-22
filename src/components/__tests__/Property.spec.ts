/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import rdf from "@ontologies/rdf";
import rdfs from "@ontologies/rdfs";
import schema from "@ontologies/schema";
import xsd from "@ontologies/xsd";
import { mount } from "enzyme";
import { defaultNS, LinkedRenderStore } from "link-lib";
import * as React from "react";

import * as ctx from "../../../test/fixtures";
import { Property } from "../Property";

const subject = defaultNS.example("41");

describe("Property component", () => {
    it("renders null when label and data are not present", () => {
        const opts = ctx.empty();
        const elem = mount(opts.wrapComponent(React.createElement(
            Property,
            { subject, ...opts.contextProps() },
        )));
        expect(elem.find(Property).children()).toHaveLength(0);
    });

    it("renders null when data is not present with forceRender", () => {
        const opts = ctx.fullCW();
        const elem = mount(opts.wrapComponent(React.createElement(
            Property,
            {
                forceRender: true,
                label: defaultNS.ex("nonexistent"),
                subject,
                ...opts.contextProps(),
            },
        )));
        expect(elem.find(Property).children()).toHaveLength(0);
    });

    it("renders the children when data is not present with forceRender and children", () => {
        const opts = ctx.fullCW();
        const elem = mount(opts.wrapComponent(React.createElement(
            Property,
            {
                children: React.createElement("span", { className: "child-elem" }),
                forceRender: true,
                label: defaultNS.ex("nonexistent"),
                subject,
                ...opts.contextProps(),
            },
        )));
        expect(elem).toContainMatchingElement(".child-elem");
    });

    it("renders the children and association renderer when data is not present with forceRender and children", () => {
        const opts = ctx.fullCW();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            ({ children }) => React.createElement("div", { className: "association" }, children),
            schema.CreativeWork,
            rdf.predicate,
        ));
        const elem = mount(opts.wrapComponent(React.createElement(
            Property,
            {
                children: React.createElement("span", { className: "child-elem" }),
                forceRender: true,
                label: defaultNS.ex("nonexistent"),
                subject,
                ...opts.contextProps(),
            },
        )));
        expect(elem).toContainMatchingElement(".association");
        expect(elem).toContainMatchingElement(".child-elem");
    });

    it("renders null when the given property is not present", () => {
        const opts = ctx.fullCW(subject);

        const comp = React.createElement(
            Property,
            { label: schema.title, ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find(Property).children()).toHaveLength(0);
    });

    it("renders the value when no view is registered", () => {
        const title = "The title";
        const opts = ctx.name(subject, title);

        const comp = React.createElement(
            Property,
            { label: schema.name, ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("div").last()).toHaveText(title);
    });

    it("renders the view", () => {
        const title = "The title";
        const opts = ctx.name(subject, title);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            () => React.createElement("div", { className: "nameProp" }),
            schema.Thing,
            schema.name,
        ));

        const comp = React.createElement(
            Property,
            { label: schema.name, ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find(Property).children()).toHaveLength(1);
        expect(elem.find(".nameProp")).toExist();
    });

    it("renders a LRC when rendering a NamedNode", () => {
        const opts = ctx.fullCW(subject);
        opts.lrs.registerAll(
            LinkedRenderStore.registerRenderer(
                () => React.createElement("p", null, "loading"),
                defaultNS.ll("LoadingResource"),
            ),
        );

        const comp = React.createElement(
            Property,
            { label: schema.author, ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("Property")).toHaveText("loading");
    });

    it("renders the literal renderer", () => {
        const opts = ctx.fullCW();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            ({ linkedProp }) => React.createElement(
                "div",
                { className: "integerRenderer", children: linkedProp.value },
            ),
            rdfs.Literal,
            xsd.integer,
        ));

        const comp = React.createElement(
            Property,
            { label: defaultNS.ex("timesRead"), ...opts.contextProps() },
        );
        const elem = mount(opts.wrapComponent(comp));

        expect(elem).toContainMatchingElement(".integerRenderer");
        expect(elem.find(".integerRenderer")).toHaveText("5");
    });

    describe("limit", () => {
        it("renders two components", () => {
            const opts = ctx.fullCW(subject);
            const comp = React.createElement(
                Property,
                { label: defaultNS.example("tags"), limit: 2, ...opts.contextProps() },
            );

            const elem = mount(opts.wrapComponent(comp));

            expect(elem.find(Property).find("LinkedResourceContainer")).toHaveLength(2);
        });

        it("renders all components", () => {
            const opts = ctx.fullCW(subject);
            const comp = React.createElement(
                Property,
                { label: defaultNS.example("tags"), limit: Infinity, ...opts.contextProps() },
            );

            const elem = mount(opts.wrapComponent(comp));

            expect(elem.find(Property).find("LinkedResourceContainer")).toHaveLength(4);
        });
    });

    describe("with children", () => {
        it("renders the children", () => {
            const title = "The title";
            const opts = ctx.name(subject, title);

            const comp = React.createElement(
                Property,
                { forceRender: true, label: schema.name, ...opts.contextProps() },
                React.createElement("p", { className: "childComponent" }, null),
            );
            const elem = mount(opts.wrapComponent(comp));

            expect(elem.find("p.childComponent")).toExist();
        });

        it("renders the children when a component was found", () => {
            const title = "The title";
            const opts = ctx.name(subject, title);
            opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
                (props) => React.createElement("div", { className: "nameProp" }, props.children),
                schema.Thing,
                schema.name,
            ));

            const comp = React.createElement(
                Property,
                { forceRender: true, label: schema.name, ...opts.contextProps() },
                React.createElement("p", { className: "childComponent" }, null),
            );
            const elem = mount(opts.wrapComponent(comp));

            expect(elem.find("p.childComponent")).toExist();
        });
    });
});
