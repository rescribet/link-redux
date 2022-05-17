/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import { LinkedRenderStore, RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import ex from "../../ontology/ex";
import example from "../../ontology/example";
import { Resource } from "../Resource";

const id = "resources/5";
const iri = example.ns(id);

const createTestElement = (testId = "testComponent") => () => React.createElement(
    "span",
    { "data-testid": testId },
);
const loadLinkedObject = () => undefined;

describe("Resource component", () => {
    it("renders null when type is not present", () => {
        const opts = ctx.empty(iri);
        const comp = React.createElement(Resource, {
            "data-testid": "testmarker",
            loadLinkedObject,
            "subject": iri,
        });

        const { container } = render(opts.wrapComponent(comp));

        expect(container.querySelectorAll("[data-testid=\"testmarker\"] > *")).toHaveLength(0);
    });

    it("loads the reference when no data is present", () => {
        const spy = jest.fn();
        const opts = ctx.empty();
        opts.lrs.queueEntity = spy;

        render(opts.wrapComponent());

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("does not load the reference when data is present", () => {
        const spy = jest.fn();
        const opts = ctx.fullCW(iri);
        opts.lrs.getEntity = spy;
        const comp = React.createElement(
            Resource,
            opts.contextProps(),
        );

        render(opts.wrapComponent(comp));

        expect(spy).not.toHaveBeenCalled();
    });

    it("renders the renderer when a subject is present", () => {
        const opts = ctx.fullCW(iri);

        const comp = createTestElement();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, schema.Thing));

        const { getByTestId } = render(opts.wrapComponent());

        expect(getByTestId("testComponent")).toBeVisible();
    });

    it("renders blank nodes", () => {
        const bn = rdfFactory.blankNode();
        const opts = ctx.chargeLRS(
            [
                rdfFactory.quadruple(bn, rdfx.type, schema.Thing),
                rdfFactory.quadruple(bn, schema.name, rdfFactory.literal("title")),
            ],
            bn,
        );

        const comp = createTestElement();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, schema.Thing));
        const { getByTestId } = render(
            opts.wrapComponent(React.createElement(Resource, {
                loadLinkedObject,
                subject: bn,
            })),
        );

        expect(getByTestId("testComponent")).toBeVisible();
    });

    it("renders children when present", () => {
        const opts = ctx.fullCW(iri);
        const loc = React.createElement(
            Resource,
            { loadLinkedObject, subject: iri },
            React.createElement("span", null, "override"),
        );
        const { getByText } = render(opts.wrapComponent(loc));

        expect(getByText("override")).toBeVisible();
    });

    const renderThroughOpts = () => {
      const opts = ctx.multipleCW(iri, { second: { id: example.ns("resources/10") } });

      opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
        createTestElement("normalRendered"),
        schema.CreativeWork,
      ));
      opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
        createTestElement("collectionRendered"),
        schema.CreativeWork,
        RENDER_CLASS_NAME,
        ex.ns("collection"),
      ));

      return opts;
    };

    it("renders correct topology through children", () => {
        const opts = renderThroughOpts();

        const comp = React.createElement(
            Resource,
            { loadLinkedObject, subject: iri, topology: ex.ns("collection") },
            React.createElement(
                Resource,
                { loadLinkedObject, subject: iri },
                React.createElement(
                    Resource,
                    { loadLinkedObject, subject: example.ns("resources/10") },
                ),
            ),
        );

        const { getByTestId } = render(opts.wrapComponent(comp));

        expect(getByTestId("collectionRendered")).toBeVisible();
    });

    it("renders default topology through children", () => {
        const opts = renderThroughOpts();

        const comp = React.createElement(
            Resource,
            { loadLinkedObject, subject: iri },
            React.createElement
            (Resource,
                { loadLinkedObject, subject: iri },
                React.createElement(
                    Resource,
                    { loadLinkedObject, subject: example.ns("resources/10") },
                ),
            ),
        );

        const { getByTestId } = render(opts.wrapComponent(comp));

        expect(getByTestId("normalRendered")).toBeVisible();
    });
});
