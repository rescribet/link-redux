/* eslint no-magic-numbers: 0 */
import rdfFactory from "@ontologies/core";
import rdfs from "@ontologies/rdfs";
import schema from "@ontologies/schema";
import { mount } from "enzyme";
import { LinkedRenderStore } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { ResourcePropTypes } from "../../components/Resource";
import ex from "../../ontology/ex";
import example from "../../ontology/example";
import { LinkOpts, MapDataToPropsParam, ReturnType } from "../../types";
import { link } from "../link";

const id = "resources/5";
const iri = example.ns(id);

class TestComponent extends React.Component {
    public render() {
        return React.createElement("span", { className: "testComponent" });
    }
}

describe("link", () => {
    describe("link HOC", () => {
        const renderWithProps = (
          props: MapDataToPropsParam,
          renderOpts?: LinkOpts,
          data: ctx.TestCtxCreator = ctx.fullCW,
          resourceProps?: Partial<ResourcePropTypes<any>>,
        ) => {
            const opts = data(iri);

            const comp = link(props, renderOpts)(TestComponent);
            opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, schema.Thing));

            return mount(opts.wrapComponent(
              undefined,
              undefined,
              undefined,
              resourceProps,
            ));
        };

        it("passes object as terms", () => {
            const elem = renderWithProps({
                author: schema.author,
                name: schema.name,
                tags: example.ns("tags"),
                text: schema.text,
            });

            expect(elem.find(TestComponent)).toHaveLength(1);
            expect(elem.find(TestComponent)).toHaveProp("name", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).toHaveProp("text", rdfFactory.literal("text"));
            expect(elem.find(TestComponent)).toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
            expect(elem.find(TestComponent)).toHaveProp("tags", example.ns("tag/0"));
        });

        it("passes object as terms under custom keys", () => {
            const elem = renderWithProps({
                author: schema.author,
                tags: example.ns("tags"),
                text: schema.text,
                title: schema.name,
            });

            expect(elem.find(TestComponent)).toHaveLength(1);
            expect(elem.find(TestComponent)).toHaveProp("title", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).not.toHaveProp("name", rdfFactory.literal("title"));
            expect(elem.find(TestComponent)).toHaveProp("text", rdfFactory.literal("text"));
            expect(elem.find(TestComponent)).toHaveProp("author", rdfFactory.namedNode("http://example.org/people/0"));
            expect(elem.find(TestComponent)).toHaveProp("tags", example.ns("tag/0"));
        });

        it("passes object with custom options", () => {
            const elem = renderWithProps({
                author: schema.author,
                name: [schema.name, rdfs.label],
                tags: {
                    label: example.ns("tags"),
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
                example.ns("tag/0"),
                example.ns("tag/1"),
                example.ns("tag/2"),
                example.ns("tag/3"),
            ]);
        });

        it("renders null without data nor forced rendering", () => {
          const elem = renderWithProps(
            { author: schema.author },
            undefined,
              ctx.empty,
            { forceRender: false },
            );

          expect(elem.find(TestComponent)).toHaveLength(0);
        });

        it("throws without properties and custom opts", () => {

          expect(() => {
            renderWithProps({}, {});
          }).toThrowError("Bind at least one prop to use render opts");
        });

        describe("returnType option", () => {
            it("can return JS native objects", () => {
                const elem = renderWithProps(
                    {
                        author: schema.author,
                        dateCreated: schema.dateCreated,
                        name: schema.name,
                        timesRead: ex.ns("timesRead"),
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

            it("defaults to terms", () => {
                const elem = renderWithProps(
                    { name: schema.name },
                  {},
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
                    example.ns("default"),
                ));
            });
        });
    });
});
