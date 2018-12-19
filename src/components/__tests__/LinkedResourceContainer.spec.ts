/* eslint no-magic-numbers: 0 */
import { mount } from "enzyme";
import { defaultNS, LinkedRenderStore, RENDER_CLASS_NAME } from "link-lib";
import { BlankNode, Literal, Statement } from "rdflib";
import { createElement } from "react";

import * as ctx from "../../../test/fixtures";
import { LinkedResourceContainer, LinkedResourceContainerComp } from "../LinkedResourceContainer";

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
        const llo = jest.fn();
        const opts = ctx.empty();
        const comp = createElement(
            (LinkedResourceContainerComp as any),
            { className: "innerLRC", loadLinkedObject: llo, ...opts.contextProps() },
        );

        const elem = mount(comp);

        expect(elem.find(".innerLRC")).toExist();
        expect(llo).toHaveBeenCalledTimes(1);
    });

    it("does not load the reference when data is present", () => {
        const llo = jest.fn();
        const opts = ctx.fullCW(iri);
        const comp = createElement(
            (LinkedResourceContainerComp as any),
            { loadLinkedObject: llo, ...opts.contextProps() },
        );

        mount(opts.wrapComponent(comp));

        expect(llo).not.toHaveBeenCalled();
    });

    it("raises when subject is not a Node", () => {
        try {
            const opts = ctx.empty("http://example.com/shouldRaise/5");
            mount(opts.wrapComponent());
            expect(true).toBeFalsy();
        } catch (e) {
            expect(e.message).toEqual('[LRC] Subject must be a node (was "string[http://example.com/shouldRaise/5]")');
        }
    });

    it("renders the renderer when an subject is present", () => {
        const opts = ctx.fullCW(iri);

        const comp = createTestElement();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));

        const elem = mount(opts.wrapComponent());

        expect(elem.find(LinkedResourceContainer)).toExist();
        expect(elem.find("span.testComponent")).toHaveLength(1);
    });

    it("renders blank nodes", () => {
        const bn = new BlankNode();
        const opts = ctx.chargeLRS(
            [
                new Statement(bn, defaultNS.rdf("type"), defaultNS.schema("Thing")),
                new Statement(bn, defaultNS.schema("name"), new Literal("title")),
            ],
            bn,
        );

        const comp = createTestElement();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(comp, defaultNS.schema("Thing")));
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
        const opts = ctx.multipleCW(iri, { second: { id: "resources/10" } });
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("normalRendered"),
            defaultNS.schema("CreativeWork"),
        ));
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("collectionRendered"),
            defaultNS.schema("CreativeWork"),
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
        const opts = ctx.multipleCW(iri, { second: { id: "resources/10" } });
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("normalRendered"),
            defaultNS.schema("CreativeWork"),
        ));
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createTestElement("collectionRendered"),
            defaultNS.schema("CreativeWork"),
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
