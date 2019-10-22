/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import rdfFactory, { SomeTerm } from "@ontologies/core";
import schema from "@ontologies/schema";
import { mount } from "enzyme";
import { DEFAULT_TOPOLOGY, defaultNS as NS } from "link-lib";
import * as React from "react";

import * as ctx from "../../../test/fixtures";
import { withLRS } from "../../hocs/withLRS";
import { PropertyBase } from "../PropertyBase";

const label = schema.name;
const subject = NS.example("41");

class CustomClass extends PropertyBase {
}

function getComp(linkedProp?: SomeTerm | undefined) {
    const test = withLRS(CustomClass);

    return React.createElement(
        test,
        {
            label,
            linkedProp,
            subject,
            topology: DEFAULT_TOPOLOGY,
        },
    );
}

describe("PropertyBase component", () => {
    describe("shouldComponentUpdate", () => {
        it("returns false without label", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            const nextProps = { subject };
            expect(elem.shouldComponentUpdate(nextProps)).toEqual(false);
        });

        it("returns true when subject is changed", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            const nextProps = { label, subject: NS.example("different") };
            expect(elem.shouldComponentUpdate(nextProps)).toEqual(true);
        });
    });

    describe("getLinkedObjectProperty", () => {
        it("returns linkedProp when present", () => {
            const opts = ctx.fullCW(subject);

            const linkedProp = rdfFactory.literal("Some prop");
            const comp = getComp(linkedProp);
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectProperty()).toEqual(linkedProp);
        });

        it("uses the render store when the property argument is given", () => {
            const opts = ctx.fullCW(subject);

            const linkedProp = rdfFactory.literal("Some prop");
            const comp = getComp(linkedProp);
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectProperty(NS.schema("text"))).toEqual(rdfFactory.literal("text"));
        });

        it("uses the render store when linkedProp is not present", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectProperty()).toEqual(rdfFactory.literal("title"));
        });
    });

    describe("getLinkedObjectPropertyRaw", () => {
        it("uses the render store to resolve", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectPropertyRaw()).toEqual([
                rdfFactory.quad(subject, label, rdfFactory.literal("title"), NS.example("default")),
            ]);
        });

        it("allows the property to be passed", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectPropertyRaw(NS.example("tags"))).toEqual([
                rdfFactory.quad(subject, NS.example("tags"), NS.example("tag/0"), NS.example("default")),
                rdfFactory.quad(subject, NS.example("tags"), NS.example("tag/1"), NS.example("default")),
                rdfFactory.quad(subject, NS.example("tags"), NS.example("tag/2"), NS.example("default")),
                rdfFactory.quad(subject, NS.example("tags"), NS.example("tag/3"), NS.example("default")),
            ]);
        });
    });

    it("renders an unhelpful message when subclass doesn't implement render", () => {
        const opts = ctx.fullCW(subject);

        const comp = getComp();
        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find(CustomClass)).toHaveText("PropBase: title");
    });
});
