/* eslint no-magic-numbers: 0 */
import rdfFactory from "@ontologies/core";
import schema from "@ontologies/schema";
import { mount } from "enzyme";
import { defaultNS, LinkedRenderStore } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { LinkOpts, MapDataToPropsParam, ReturnType } from "../../types";
import { link } from "../link";

const id = "resources/5";
const iri = defaultNS.example(id);

class TestComponent extends React.Component {
    public render() {
        return React.createElement("span", { className: "testComponent" });
    }
}

describe("link", () => {
    describe("link HOC", () => {
        const renderWithProps = (props: MapDataToPropsParam, renderOpts?: LinkOpts) => {
            const opts = ctx.fullCW(iri);

            const comp = link(props, renderOpts)(TestComponent);
            opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, schema.Thing));

            return mount(opts.wrapComponent());
        };

        it("passes object as terms", () => {
            const elem = renderWithProps({
                author: schema.author,
                name: schema.name,
                tags: defaultNS.example("tags"),
                text: schema.text,
            });

            expect(elem.find(TestComponent)).toHaveLength(1);
            expect(elem.find(TestComponent)).toHaveProp("name", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).toHaveProp("text", rdfFactory.literal("text"));
            expect(elem.find(TestComponent)).toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
            expect(elem.find(TestComponent)).toHaveProp("tags", defaultNS.example("tag/0"));
        });

        it("passes object as terms under custom keys", () => {
            const elem = renderWithProps({
                author: schema.author,
                tags: defaultNS.example("tags"),
                text: schema.text,
                title: schema.name,
            });

            expect(elem.find(TestComponent)).toHaveLength(1);
            expect(elem.find(TestComponent)).toHaveProp("title", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).not.toHaveProp("name", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).toHaveProp("text", rdfFactory.literal("text"));
            expect(elem.find(TestComponent)).toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
            expect(elem.find(TestComponent)).toHaveProp("tags", defaultNS.example("tag/0"));
        });

        it("passes object with custom options", () => {
            const elem = renderWithProps({
                author: schema.author,
                name: [schema.name, defaultNS.rdfs("label")],
                tags: {
                    label: defaultNS.example("tags"),
                    limit: Infinity,
                },
                text: schema.text,
            });

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
                const elem = renderWithProps(
                    {
                        author: schema.author,
                        dateCreated: schema.dateCreated,
                        name: schema.name,
                        timesRead: defaultNS.ex("timesRead"),
                    },
                    { returnType: ReturnType.Literal },
                );

                expect(elem.find(TestComponent)).toHaveLength(1);
                expect(elem.find(TestComponent)).toHaveProp("name", "title");
                expect(elem.find(TestComponent)).toHaveProp("timesRead", 5);
                expect(elem.find(TestComponent)).toHaveProp("dateCreated", new Date("2019-01-01"));
                expect(elem.find(TestComponent))
                  .toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
            });

            it("can return values", () => {
                const elem = renderWithProps(
                    { name: schema.name },
                    { returnType: ReturnType.Value },
                );

                expect(elem.find(TestComponent)).toHaveLength(1);
                expect(elem.find(TestComponent)).toHaveProp("name", "title");
            });

            it("can return terms", () => {
                const elem = renderWithProps(
                    { name: schema.name },
                    { returnType: ReturnType.Term },
                );

                expect(elem.find(TestComponent)).toHaveLength(1);
                expect(elem.find(TestComponent)).toHaveProp("name", rdfFactory.literal("title"));
            });

            it("can return statements", () => {
                const elem = renderWithProps(
                    { name: schema.name },
                    { returnType: ReturnType.Statement },
                );

                expect(elem.find(TestComponent)).toHaveLength(1);
                expect(elem.find(TestComponent)).toHaveProp("name", rdfFactory.quad(
                    iri,
                    schema.name,
                    rdfFactory.literal("title"),
                    defaultNS.example("default"),
                ));
            });
        });
    });
});
