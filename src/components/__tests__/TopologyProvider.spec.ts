/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import rdf from "@ontologies/core";
import { mount } from "enzyme";
import { defaultNS, LinkedRenderStore, RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import { LinkedResourceContainer } from "../LinkedResourceContainer";
import { TopologyProvider } from "../TopologyProvider";

const id = "resources/5";
const iri = defaultNS.example(id);

const createTestElement = (className = "testComponent") => () => React.createElement(
    "span",
    { className },
);

describe("TopologyProvider component", () => {
    it("sets the topology", () => {
        const opts = ctx.multipleCWArr([{ id: iri }, { id: defaultNS.example("resources/10") }]);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("normalRendered"),
            defaultNS.schema("CreativeWork"),
        ));
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("collectionRendered"),
            defaultNS.schema("CreativeWork"),
            RENDER_CLASS_NAME,
            defaultNS.example("collection"),
        ));

        class CollectionProvider extends TopologyProvider {
            constructor(props: any) {
                super(props);
                this.topology = defaultNS.example("collection");
            }
        }

        const comp = React.createElement(
            CollectionProvider,
            null,
            React.createElement(
                LinkedResourceContainer,
                { subject: defaultNS.example("resources/10") },
            ),
        );

        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("span").last()).toHaveClassName("collectionRendered");
    });

    it("sets a class name", () => {
        const opts = ctx.multipleCW(iri, { second: { id: rdf.namedNode("about:resources/10") } });
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("normalRendered"),
            defaultNS.schema("CreativeWork"),
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

        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("div").last()).toHaveClassName("test-class");
    });
});
