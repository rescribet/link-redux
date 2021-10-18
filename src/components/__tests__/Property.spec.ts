/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import * as rdf from "@ontologies/rdf";
import * as rdfs from "@ontologies/rdfs";
import * as schema from "@ontologies/schema";
import * as xsd from "@ontologies/xsd";
import { render } from "@testing-library/react";
import { ComponentRegistration, LinkedRenderStore } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import ex from "../../ontology/ex";
import example from "../../ontology/example";
import ll from "../../ontology/ll";
import { register } from "../../register";
import { FC, PropertyProps } from "../../types";
import { Property } from "../Property";

const subject = example.ns("41");

describe("Property component", () => {
    const renderProp = (props: object = {}, registrations: Array<ComponentRegistration<any>> = []) => {
        const opts = ctx.fullCW();
        opts.lrs.registerAll(registrations);
        const element = React.createElement(
          Property,
          {
            "data-testid": "id",
            "forceRender": true,
            "label": ex.ns("nonexistent"),
            ...opts.contextProps(),
            ...props,
          },
        );

        return render(opts.wrapComponent(element));
    };

    it("renders null when label and data are not present", () => {
        const { container } = renderProp({
            forceRender: false,
            label: undefined,
        });

        expect(container.querySelectorAll("[data-testid=\"root\"] > *")).toHaveLength(0);
    });

    it("renders null when data is not present with forceRender", () => {
        const { container } = renderProp();

        expect(container.querySelectorAll("[data-testid=\"root\"] > *")).toHaveLength(0);
    });

    it("renders the children when data is not present with forceRender and children", () => {
        const { getByTestId } = renderProp({ children: React.createElement("span", { "data-testid": "child-elem" }) });

        expect(getByTestId("child-elem")).toBeVisible();
    });

    it("renders the children and association renderer when data is not present with forceRender and children", () => {
        const regs = LinkedRenderStore.registerRenderer(
            ({ children }: any) => React.createElement("div", { "data-testid": "association" }, children),
            schema.CreativeWork,
            rdf.predicate,
        );
        const { getByTestId } = renderProp({
          children: React.createElement("span", { "data-testid": "association-child" }),
        }, regs);

        expect(getByTestId("association")).toBeVisible();
        expect(getByTestId("association-child")).toBeVisible();
    });

    it("renders null when the given property is not present", () => {
        const opts = ctx.fullCW(subject);

        const comp = React.createElement(
            Property,
            { label: schema.title, ...opts.contextProps() },
        );
        const { container } = render(opts.wrapComponent(comp));

        expect(container.querySelectorAll("[data-testid=\"root\"] > *")).toHaveLength(0);
    });

    it("renders the value when no view is registered", () => {
        const title = "The title";
        const opts = ctx.name(subject, title);

        const comp = React.createElement(
            Property,
            { label: schema.name, ...opts.contextProps() },
        );
        const { getByText } = render(opts.wrapComponent(comp));

        expect(getByText(title)).toBeVisible();
    });

    it("renders the view", () => {
        const title = "The title";
        const opts = ctx.name(subject, title);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            () => React.createElement("div", { "data-testid": "nameProp" }),
            schema.Thing,
            schema.name,
        ));

        const comp = React.createElement(
            Property,
            { label: schema.name, ...opts.contextProps() },
        );
        const { getByTestId } = render(opts.wrapComponent(comp));

        expect(getByTestId("nameProp")).toBeVisible();
    });

    it("renders a LRC when rendering a NamedNode", () => {
        const opts = ctx.fullCW(subject);
        opts.lrs.registerAll(
            LinkedRenderStore.registerRenderer(
                () => React.createElement("p", null, "loading"),
                ll.LoadingResource,
            ),
        );

        const comp = React.createElement(
            Property,
            { label: schema.author, ...opts.contextProps() },
        );
        const { getByText } = render(opts.wrapComponent(comp));

        expect(getByText("loading")).toBeVisible();
    });

    it("renders the literal renderer", () => {
        const opts = ctx.fullCW();
        const component: FC<PropertyProps> = ({ linkedProp }) => {
          return React.createElement(
            "div",
            { "data-testid": "integerRenderer", "children": linkedProp.value },
          );
        };
        component.type = rdfs.Literal;
        component.property = xsd.integer;

        opts.lrs.registerAll(register(component));

        const comp = React.createElement(
            Property,
            { label: ex.ns("timesRead"), ...opts.contextProps() },
        );
        const { getByTestId } = render(opts.wrapComponent(comp));

        expect(getByTestId("integerRenderer")).toBeVisible();
        expect(getByTestId("integerRenderer")).toHaveTextContent("5");
    });

    describe("limit", () => {
        it("renders two components", () => {
            const regs = LinkedRenderStore.registerRenderer(
              ({ children }: any) => React.createElement("div", { "data-testid": "id" }, children),
              schema.CreativeWork,
              example.ns("tags"),
            );

            const { getAllByTestId } = renderProp({
              label: example.ns("tags"),
              limit: 2,
            }, regs);

            expect(getAllByTestId("id")).toHaveLength(2);
        });

        it("renders all components", () => {
            const opts = ctx.fullCW(subject);
            const comp = React.createElement(
                Property,
                { label: example.ns("tags"), limit: Infinity, ...opts.contextProps() },
            );

            const { container } = render(opts.wrapComponent(comp));

            expect(container.querySelectorAll("[data-testid=\"root\"] > *")).toHaveLength(0);
        });
    });

    describe("with children", () => {
        const title = "The title";
        const renderWithChildren = (registrations: Array<ComponentRegistration<any>> = []) => {
            const opts = ctx.name(subject, title);

            const comp = React.createElement(
                Property,
                { forceRender: true, label: schema.name, ...opts.contextProps() },
                React.createElement("p", { "data-testid": "childComponent" }, null),
            );
            opts.lrs.registerAll(registrations);

            return render(opts.wrapComponent(comp));
        };

        it("renders the children", () => {
            const { getByTestId } = renderWithChildren();

            expect(getByTestId("childComponent")).toBeVisible();
        });

        it("renders the children when a component was found", () => {
            const regs = LinkedRenderStore.registerRenderer(
                (props: any) => React.createElement("div", { "data-testid": "nameProp" }, props.children),
                schema.Thing,
                schema.name,
            );
            const { getByTestId } = renderWithChildren(regs);

            expect(getByTestId("nameProp")).toBeVisible();
        });
    });
});
