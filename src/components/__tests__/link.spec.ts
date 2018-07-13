/* eslint no-magic-numbers: 0 */
import { mount } from "enzyme";
import { defaultNS, LinkedRenderStore } from "link-lib";
import { BlankNode, Literal, NamedNode, Statement } from "rdflib";
import * as React from "react";
import { Component, createElement } from "react";

import * as ctx from "../../../test/fixtures";
import { link } from "../link";

const id = "resources/5";
const iri = defaultNS.example(id);

class TestComponent extends Component {
    public render() {
        return React.createElement("span", { className: "testComponent" });
    }
}

describe("link higher order component", () => {
    it("passes named node array as terms", () => {
        const opts = ctx.fullCW(iri);

        const comp = link([
            defaultNS.schema("name"),
            defaultNS.schema("text"),
            defaultNS.schema("author"),
            defaultNS.example("tags"),
        ])(TestComponent);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

        const elem = mount(opts.wrapComponent());

        expect(elem.find(TestComponent)).toHaveLength(1);
        expect(elem.find(TestComponent)).toHaveProp("name", new Literal("title"));
        expect(elem.find(TestComponent)).toHaveProp("text", new Literal("text"));
        expect(elem.find(TestComponent)).toHaveProp("author", new NamedNode("http://example.org/people/0"));
        expect(elem.find(TestComponent)).toHaveProp("tags", defaultNS.example("tag/0"));
    });

    it("passes object as terms", () => {
        const opts = ctx.fullCW(iri);

        const comp = link({
            author: defaultNS.schema("author"),
            name: defaultNS.schema("name"),
            tags: defaultNS.example("tags"),
            text: defaultNS.schema("text"),
        })(TestComponent);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

        const elem = mount(opts.wrapComponent());

        expect(elem.find(TestComponent)).toHaveLength(1);
        expect(elem.find(TestComponent)).toHaveProp("name", new Literal("title"));
        expect(elem.find(TestComponent)).toHaveProp("text", new Literal("text"));
        expect(elem.find(TestComponent)).toHaveProp("author", new NamedNode("http://example.org/people/0"));
        expect(elem.find(TestComponent)).toHaveProp("tags", defaultNS.example("tag/0"));
    });

    it("passes object as terms under custom keys", () => {
        const opts = ctx.fullCW(iri);

        const comp = link({
            author: defaultNS.schema("author"),
            tags: defaultNS.example("tags"),
            text: defaultNS.schema("text"),
            title: defaultNS.schema("name"),
        })(TestComponent);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

        const elem = mount(opts.wrapComponent());

        expect(elem.find(TestComponent)).toHaveLength(1);
        expect(elem.find(TestComponent)).toHaveProp("title", new Literal("title"));
        expect(elem.find(TestComponent)).not.toHaveProp("name", new Literal("title"));
        expect(elem.find(TestComponent)).toHaveProp("text", new Literal("text"));
        expect(elem.find(TestComponent)).toHaveProp("author", new NamedNode("http://example.org/people/0"));
        expect(elem.find(TestComponent)).toHaveProp("tags", defaultNS.example("tag/0"));
    });
    it("passes object with custom options", () => {
        const opts = ctx.fullCW(iri);

        const comp = link({
            author: defaultNS.schema("author"),
            tags: {
                label: defaultNS.example("tags"),
                limit: Infinity,
            },
            text: defaultNS.schema("text"),
            title: defaultNS.schema("name"),
        })(TestComponent);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

        const elem = mount(opts.wrapComponent());

        expect(elem.find(TestComponent)).toHaveLength(1);
        expect(elem.find(TestComponent)).toHaveProp("title", new Literal("title"));
        expect(elem.find(TestComponent)).not.toHaveProp("name", new Literal("title"));
        expect(elem.find(TestComponent)).toHaveProp("text", new Literal("text"));
        expect(elem.find(TestComponent)).toHaveProp("author", new NamedNode("http://example.org/people/0"));
        expect(elem.find(TestComponent)).toHaveProp("tags", [
            defaultNS.example("tag/0"),
            defaultNS.example("tag/1"),
            defaultNS.example("tag/2"),
            defaultNS.example("tag/3"),
        ]);
    });
});
