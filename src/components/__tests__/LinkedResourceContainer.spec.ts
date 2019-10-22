/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import rdfFactory from "@ontologies/core";
import schema from "@ontologies/schema";
import { mount } from "enzyme";
import { defaultNS, LinkedRenderStore, RENDER_CLASS_NAME } from "link-lib";
import { createElement } from "react";

import * as ctx from "../../../test/fixtures";
import { LinkedResourceContainer } from "../LinkedResourceContainer";

const id = "resources/5";
const iri = defaultNS.example(id);

const createTestElement = (className = "testComponent") => () => createElement(
    "span",
    { className },
);
const loadLinkedObject = () => undefined;

describe("LinkedResourceContainer component", () => {
    it("renders null when type is not present", () => {
        const opts = ctx.empty(iri);
        const comp = createElement(LinkedResourceContainer, {
            className: "testmarker",
            loadLinkedObject,
            subject: iri,
        });

        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("LinkedResourceContainer.testmarker").children())
            .toHaveLength(0);
    });

    it("loads the reference when no data is present", () => {
        const spy = jest.fn();
        const opts = ctx.empty();
        opts.lrs.queueEntity = spy;

        mount(opts.wrapComponent());

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it("does not load the reference when data is present", () => {
        const spy = jest.fn();
        const opts = ctx.fullCW(iri);
        opts.lrs.getEntity = spy;
        const comp = createElement(
            LinkedResourceContainer,
            opts.contextProps(),
        );

        mount(opts.wrapComponent(comp));

        expect(spy).not.toHaveBeenCalled();
    });

    it("renders the renderer when an subject is present", () => {
        const opts = ctx.fullCW(iri);

        const comp = createTestElement();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, schema.Thing));

        const elem = mount(opts.wrapComponent());

        expect(elem.find(LinkedResourceContainer)).toExist();
        expect(elem.find("span.testComponent")).toHaveLength(1);
    });

    it("renders blank nodes", () => {
        const bn = rdfFactory.blankNode();
        const opts = ctx.chargeLRS(
            [
                rdfFactory.quad(bn, defaultNS.rdf("type"), schema.Thing),
                rdfFactory.quad(bn, schema.name, rdfFactory.literal("title")),
            ],
            bn,
        );

        const comp = createTestElement();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, schema.Thing));
        const elem = mount(
            opts.wrapComponent(createElement(LinkedResourceContainer, {
                loadLinkedObject,
                subject: bn,
            })),
        );

        expect(elem.find("span.testComponent")).toExist();
    });

    it("renders children when present", () => {
        const opts = ctx.fullCW(iri);
        const loc = createElement(
            LinkedResourceContainer,
            { loadLinkedObject, subject: iri },
            createElement("span", null, "override"),
        );
        const elem = mount(opts.wrapComponent(loc));

        expect(elem.find("span").last()).toHaveText("override");
    });

    it("renders correct topology through children", () => {
        const opts = ctx.multipleCW(iri, { second: { id: rdfFactory.namedNode("resources/10") } });
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("normalRendered"),
            schema.CreativeWork,
        ));
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("collectionRendered"),
            schema.CreativeWork,
            RENDER_CLASS_NAME,
            defaultNS.argu("collection"),
        ));

        const comp = createElement(
            LinkedResourceContainer,
            { loadLinkedObject, subject: iri, topology: defaultNS.argu("collection") },
            createElement(
                LinkedResourceContainer,
                { loadLinkedObject, subject: iri },
                createElement(
                    LinkedResourceContainer,
                    { loadLinkedObject, subject: defaultNS.example("resources/10") },
                ),
            ),
        );

        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("span").last()).toHaveClassName("collectionRendered");
    });

    it("renders default topology through children", () => {
        const opts = ctx.multipleCW(iri, { second: { id: rdfFactory.namedNode("resources/10") } });
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("normalRendered"),
            schema.CreativeWork,
        ));
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("collectionRendered"),
            schema.CreativeWork,
            RENDER_CLASS_NAME,
            defaultNS.argu("collection"),
        ));

        const comp = createElement(
            LinkedResourceContainer,
            { loadLinkedObject, subject: iri },
            createElement
            (LinkedResourceContainer,
                { loadLinkedObject, subject: iri },
                createElement(
                    LinkedResourceContainer,
                    { loadLinkedObject, subject: defaultNS.example("resources/10") },
                ),
            ),
        );

        const elem = mount(opts.wrapComponent(comp));

        expect(elem.find("span").last()).toHaveClassName("normalRendered");
    });
});
