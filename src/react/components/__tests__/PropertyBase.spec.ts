/* eslint no-magic-numbers: 0 */
import { mount } from "enzyme";
import { defaultNS as NS } from "link-lib";
import { Literal, SomeTerm, Statement } from "rdflib";
import * as React from "react";

import * as ctx from "../../../../test/fixtures";
import { PropertyBase } from "../PropertyBase";
import { withLRS } from "../RenderStoreProvider";

const label = NS.schema("name");
const subject = NS.example("41");
const version = "new";

class CustomClass extends PropertyBase {
}

function getComp(linkedProp?: SomeTerm | undefined) {
    const test = withLRS(CustomClass);

    return React.createElement(test, { label, linkedProp, subject, version });
}

describe("PropertyBase component", () => {
    describe("shouldComponentUpdate", () => {
        it("returns false without label", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            const nextProps = { subject, version };
            expect(elem.shouldComponentUpdate(nextProps)).toEqual(false);
        });

        it("returns false when subject and version are unchanged", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            const nextProps = { label, subject, version };
            expect(elem.shouldComponentUpdate(nextProps)).toEqual(false);
        });

        it("returns true when subject is changed", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            const nextProps = { label, subject: NS.example("different"), version };
            expect(elem.shouldComponentUpdate(nextProps)).toEqual(true);
        });

        it("returns true when version is changed", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            const nextProps = { label, subject, version: "different" };
            expect(elem.shouldComponentUpdate(nextProps)).toEqual(true);
        });
    });

    describe("getLinkedObjectProperty", () => {
        it("returns linkedProp when present", () => {
            const opts = ctx.fullCW(subject);

            const linkedProp = new Literal("Some prop");
            const comp = getComp(linkedProp);
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectProperty()).toEqual(linkedProp);
        });

        it("uses the render store when the property argument is given", () => {
            const opts = ctx.fullCW(subject);

            const linkedProp = new Literal("Some prop");
            const comp = getComp(linkedProp);
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectProperty(NS.schema("text"))).toEqual(new Literal("text"));
        });

        it("uses the render store when linkedProp is not present", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectProperty()).toEqual(new Literal("title"));
        });
    });

    describe("getLinkedObjectPropertyRaw", () => {
        it("uses the render store to resolve", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectPropertyRaw()).toEqual([
                new Statement(subject, label, new Literal("title"), NS.example("default")),
            ]);
        });

        it("allows the property to be passed", () => {
            const opts = ctx.fullCW(subject);

            const comp = getComp();
            const elem = mount(opts.wrapComponent(comp)).find(CustomClass).instance();

            expect(elem.getLinkedObjectPropertyRaw(NS.example("tags"))).toEqual([
                new Statement(subject, NS.example("tags"), NS.example("tag/0"), NS.example("default")),
                new Statement(subject, NS.example("tags"), NS.example("tag/1"), NS.example("default")),
                new Statement(subject, NS.example("tags"), NS.example("tag/2"), NS.example("default")),
                new Statement(subject, NS.example("tags"), NS.example("tag/3"), NS.example("default")),
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
