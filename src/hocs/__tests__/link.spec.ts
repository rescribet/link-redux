/* eslint no-magic-numbers: 0 */
import rdfFactory from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import * as rdfs from "@ontologies/rdfs";
import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
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

describe("link", () => {
    describe("link HOC", () => {
        let props: any;

        beforeEach(() => {
          props = undefined;
        });

        class TestComponent extends React.Component {
            public render() {
                props = this.props;

                return React.createElement("span");
            }
        }

        const renderWithProps = (
          propMap: MapDataToPropsParam,
          renderOpts?: LinkOpts,
          data: ctx.TestCtxCreator = ctx.fullCW,
          resourceProps?: Partial<ResourcePropTypes<any>>,
        ) => {
            const opts = data(iri);

            const comp = link(propMap, renderOpts)(TestComponent);
            opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, schema.Thing));

            return render(opts.wrapComponent(
              undefined,
              undefined,
              undefined,
              resourceProps,
            ));
        };

        it("passes object as terms", () => {
            renderWithProps({
                author: schema.author,
                name: schema.name,
                tags: example.ns("tags"),
                text: schema.text,
            });

            expect(props.name).toEqual(rdfFactory.literal("title"));
            expect(props.text).toEqual(rdfFactory.literal("text", rdfx.langString));
            expect(props.author).toEqual(rdfFactory.namedNode("http://example.org/people/0"));
            expect(props.tags).toEqual(example.ns("tag/0"));
        });

        it("passes object as terms under custom keys", () => {
            renderWithProps({
                author: schema.author,
                tags: example.ns("tags"),
                text: schema.text,
                title: schema.name,
            });

            expect(props.title).toEqual(rdfFactory.literal("title"));
            expect(props.name).not.toEqual(rdfFactory.literal("title"));
            expect(props.text).toEqual(rdfFactory.literal("text", rdfx.langString));
            expect(props.author).toEqual(rdfFactory.namedNode("http://example.org/people/0"));
            expect(props.tags).toEqual(example.ns("tag/0"));
        });

        it("passes object with custom options", () => {
            renderWithProps({
                author: schema.author,
                name: [schema.name, rdfs.label],
                tags: {
                    label: example.ns("tags"),
                    returnType: ReturnType.AllLiterals,
                },
                text: schema.text,
            });

            expect(props.label).not.toBeDefined();
            expect(props.name).toEqual(rdfFactory.literal("title"));
            expect(props.text).toEqual(rdfFactory.literal("text", rdfx.langString));
            expect(props.author).toEqual(rdfFactory.namedNode("http://example.org/people/0"));
            expect(props.tags).toEqual([
                example.ns("tag/0"),
                example.ns("tag/1"),
                example.ns("tag/2"),
                example.ns("tag/3"),
            ]);
        });

        it("renders null without data nor forced rendering", () => {
          expect(props).toEqual(undefined);

          renderWithProps(
            { author: schema.author },
            undefined,
              ctx.empty,
            { forceRender: false },
            );

          expect(props).toEqual(undefined);
        });

        it("throws without properties and custom opts", () => {
          expect(() => {
            renderWithProps({}, {});
          }).toThrowError("Bind at least one prop to use render opts");
        });

        describe("returnType option", () => {
            it("can return JS native objects", () => {
                renderWithProps(
                    {
                        author: schema.author,
                        dateCreated: schema.dateCreated,
                        name: schema.name,
                        timesRead: ex.ns("timesRead"),
                    },
                    { returnType: ReturnType.Literal },
                );

                expect(props.name).toEqual("title");
                expect(props.timesRead).toEqual(5);
                expect(props.dateCreated).toEqual(new Date("2019-01-01"));
                expect(props.author).toEqual(rdfFactory.namedNode("http://example.org/people/0"));
            });

            it("can return values", () => {
                renderWithProps(
                    { name: schema.name },
                    { returnType: ReturnType.Value },
                );

                expect(props.name).toEqual("title");
            });

            it("can return terms", () => {
                renderWithProps(
                    { name: schema.name },
                    { returnType: ReturnType.Term },
                );

                expect(props.name).toEqual(rdfFactory.literal("title"));
            });

            it("defaults to terms", () => {
                renderWithProps(
                    { name: schema.name },
                  {},
                );

                expect(props.name).toEqual(rdfFactory.literal("title"));
            });

            it("can return statements", () => {
                renderWithProps(
                    { name: schema.name },
                    { returnType: ReturnType.Statement },
                );

                expect(props.name).toEqual(rdfFactory.quad(
                    iri,
                    schema.name,
                    rdfFactory.literal("title"),
                    rdfFactory.defaultGraph(),
                ));
            });
        });
    });
});
