/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import rdf, { NamedNode } from "@ontologies/core";
import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import { LinkedRenderStore, RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";
import { Resource } from "../Resource";
import { TopologyProvider } from "../TopologyProvider";

const id = "resources/5";
const iri = example.ns(id);

const createTestElement = (testId = "testComponent") => () => React.createElement(
    "span",
    { "data-testid": testId },
);

describe("TopologyProvider component", () => {
    it("sets the topology", () => {
        const opts = ctx.multipleCWArr([{ id: iri }, { id: example.ns("resources/10") }]);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("normalRendered"),
            schema.CreativeWork,
        ));
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("collectionRendered"),
            schema.CreativeWork,
            RENDER_CLASS_NAME,
            example.ns("collection"),
        ));

        class CollectionProvider extends TopologyProvider {
            constructor(props: any) {
                super(props);
                this.topology = example.ns("collection");
            }
        }

        const comp = React.createElement(
            CollectionProvider,
            null,
            React.createElement(
                Resource,
                { subject: example.ns("resources/10") },
            ),
        );

        const { getByTestId } = render(opts.wrapComponent(comp));

        expect(getByTestId("collectionRendered")).toBeVisible();
    });

    it("sets a class name", () => {
        const opts = ctx.multipleCW(iri, { second: { id: rdf.namedNode("about:resources/10") } });
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("normalRendered"),
            schema.CreativeWork,
        ));

        // tslint:disable-next-line max-classes-per-file
        class ClassNameProvider extends TopologyProvider {
            constructor(props: any) {
                super(props);
                this.className = "test-class";
            }
        }

        const comp = React.createElement(
            ClassNameProvider,
            null,
            React.createElement("span", null),
        );

        const { container } = render(opts.wrapComponent(comp));

        expect(container.querySelector(".test-class")).toBeVisible();
    });

    describe("#wrap", () => {
      it("allows a render function", () => {
        const opts = ctx.multipleCW(iri);
        // tslint:disable-next-line:max-classes-per-file
        class TestProvider extends TopologyProvider {
          constructor(props: any) {
            super(props);
            this.topology = example.ns("test");
          }
        }

        const comp = React.createElement(
          TestProvider,
          null,
          (subject: NamedNode) => React.createElement(
            "span",
            { "data-testid": subject.value },
            null,
          ),
        );

        const { getByTestId } = render(opts.wrapComponent(comp));

        expect(getByTestId(iri.value)).toBeVisible();
      });
    });
});
