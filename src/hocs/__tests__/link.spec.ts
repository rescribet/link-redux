/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";
import { mount } from "enzyme";
import { defaultNS, LinkedRenderStore } from "link-lib";
import * as React from "react";
import { Component } from "react";

import * as ctx from "../../../test/fixtures";
import { dataPropsToPropMap, link } from "../link";

const id = "resources/5";
const iri = defaultNS.example(id);

class TestComponent extends Component {
    public render() {
        return React.createElement("span", { className: "testComponent" });
    }
}

describe("link", () => {
    describe("dataPropsToPropMap", () => {
        describe("with array mapping", () => {
            it("throws with an empty map", () => {
                expect(() => {
                    dataPropsToPropMap([], {});
                }).toThrowError(TypeError);
            });
        });

        describe("with object mapping", () => {
            it("processes an empty map", () => {
                const [ propMap, requestedProperties ] = dataPropsToPropMap({}, {});

                expect(propMap).toEqual({});
                expect(requestedProperties).toHaveLength(0);
            });

            it("processes a map with an array value", () => {
                const [ propMap, requestedProperties ] = dataPropsToPropMap({
                    cLabel: [defaultNS.ex("p"), defaultNS.ex("q")],
                }, {});

                expect(propMap).toHaveProperty("cLabel");
                expect(requestedProperties).toEqual([
                    rdfFactory.id(defaultNS.ex("p")),
                    rdfFactory.id(defaultNS.ex("q")),
                ]);

                const { cLabel } = propMap;
                expect(cLabel).toHaveProperty("label", [defaultNS.ex("p"), defaultNS.ex("q")]);
                expect(cLabel).toHaveProperty("name", "cLabel");
            });

            it("throws when a map with an array value has no members", () => {
                expect(() => {
                    dataPropsToPropMap({
                        cLabel: [],
                    }, {});
                }).toThrowError(TypeError);
            });

            it("processes a map with a NamedNode value", () => {
                const [ propMap, requestedProperties ] = dataPropsToPropMap({
                    cLabel: defaultNS.ex("p"),
                }, {});

                expect(propMap).toHaveProperty("cLabel");
                expect(requestedProperties).toEqual([rdfFactory.id(defaultNS.ex("p"))]);

                const { cLabel } = propMap;
                expect(cLabel).toHaveProperty("label", [defaultNS.ex("p")]);
                expect(cLabel).toHaveProperty("name", "cLabel");
            });

            it("skips others' properties", () => {
                const dataProps = Object.create({ oLabel: defaultNS.ex("o") });
                dataProps.cLabel = defaultNS.ex("p");

                const [ propMap, requestedProperties ] = dataPropsToPropMap(dataProps, {});

                expect(propMap).toHaveProperty("cLabel");
                expect(propMap).not.toHaveProperty("oLabel");
                expect(requestedProperties).toEqual([rdfFactory.id(defaultNS.ex("p"))]);

                const { cLabel } = propMap;
                expect(cLabel).toHaveProperty("label", [defaultNS.ex("p")]);
                expect(cLabel).toHaveProperty("name", "cLabel");
            });

            it("processes a map with object value", () => {
                const [ propMap, requestedProperties ] = dataPropsToPropMap({
                    cLabel: {
                        label: defaultNS.ex("p"),
                    },
                }, {});

                expect(propMap).toHaveProperty("cLabel");
                expect(requestedProperties).toEqual([rdfFactory.id(defaultNS.ex("p"))]);

                const { cLabel } = propMap;
                expect(cLabel).toHaveProperty("label", [defaultNS.ex("p")]);
                expect(cLabel).toHaveProperty("name", "cLabel");
            });

            it("throws when a map with object value has no label", () => {
                expect(() => {
                    dataPropsToPropMap({
                        cLabel: {
                            label: undefined,
                        },
                    }, {});
                }).toThrowError(TypeError);
            });
        });
    });

    describe("link HOC", () => {
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
            expect(elem.find(TestComponent)).toHaveProp("name", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).toHaveProp("text", rdfFactory.literal("text"));
            expect(elem.find(TestComponent)).toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
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
            expect(elem.find(TestComponent)).toHaveProp("name", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).toHaveProp("text", rdfFactory.literal("text"));
            expect(elem.find(TestComponent)).toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
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
            expect(elem.find(TestComponent)).toHaveProp("title", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).not.toHaveProp("name", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).toHaveProp("text", rdfFactory.literal("text"));
            expect(elem.find(TestComponent)).toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
            expect(elem.find(TestComponent)).toHaveProp("tags", defaultNS.example("tag/0"));
        });

        it("passes object with custom options", () => {
            const opts = ctx.fullCW(iri);

            const comp = link({
                author: defaultNS.schema("author"),
                name: [defaultNS.schema("name"), defaultNS.rdfs("label")],
                tags: {
                    label: defaultNS.example("tags"),
                    limit: Infinity,
                },
                text: defaultNS.schema("text"),
            })(TestComponent);
            opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

            const elem = mount(opts.wrapComponent());

            expect(elem.find(TestComponent)).toHaveLength(1);
            expect(elem.find(TestComponent)).not.toHaveProp("label");
            expect(elem.find(TestComponent)).toHaveProp("name", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).toHaveProp("text", rdfFactory.literal("text"));
            expect(elem.find(TestComponent)).toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
            expect(elem.find(TestComponent)).toHaveProp("tags", [
                defaultNS.example("tag/0"),
                defaultNS.example("tag/1"),
                defaultNS.example("tag/2"),
                defaultNS.example("tag/3"),
            ]);
        });

        describe("returnType option", () => {
            it("can return JS native objects", () => {
                const opts = ctx.fullCW(iri);

                const comp = link(
                    [
                        defaultNS.schema("name"),
                        defaultNS.ex("timesRead"),
                        defaultNS.schema("dateCreated"),
                        defaultNS.schema("author"),
                    ],
                    { returnType: "literal" },
                )(TestComponent);
                opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

                const elem = mount(opts.wrapComponent());

                expect(elem.find(TestComponent)).toHaveLength(1);
                expect(elem.find(TestComponent)).toHaveProp("name", "title");
                expect(elem.find(TestComponent)).toHaveProp("timesRead", 5);
                expect(elem.find(TestComponent)).toHaveProp("dateCreated", new Date("2019-01-01"));
                expect(elem.find(TestComponent))
                  .toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
            });

            it("can return values", () => {
                const opts = ctx.fullCW(iri);

                const comp = link(
                    [defaultNS.schema("name")],
                    { returnType: "value" },
                )(TestComponent);
                opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

                const elem = mount(opts.wrapComponent());

                expect(elem.find(TestComponent)).toHaveLength(1);
                expect(elem.find(TestComponent)).toHaveProp("name", "title");
            });

            it("can return terms", () => {
                const opts = ctx.fullCW(iri);

                const comp = link(
                    [defaultNS.schema("name")],
                    { returnType: "term" },
                )(TestComponent);
                opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

                const elem = mount(opts.wrapComponent());

                expect(elem.find(TestComponent)).toHaveLength(1);
                expect(elem.find(TestComponent)).toHaveProp("name", rdfFactory.literal("title"));
            });

            it("can return statements", () => {
                const opts = ctx.fullCW(iri);

                const comp = link(
                    [defaultNS.schema("name")],
                    { returnType: "statement" },
                )(TestComponent);
                opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

                const elem = mount(opts.wrapComponent());

                expect(elem.find(TestComponent)).toHaveLength(1);
                expect(elem.find(TestComponent)).toHaveProp("name", rdfFactory.quad(
                    opts.subject,
                    defaultNS.schema("name"),
                    rdfFactory.literal("title"),
                    defaultNS.example("default"),
                ));
            });
        });
    });
});
