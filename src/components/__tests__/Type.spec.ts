/* eslint no-magic-numbers: 0 */
import * as schema from "@ontologies/schema";
import { render } from "@testing-library/react";
import { LinkedRenderStore, RecordState } from "link-lib";
import React from "react";

import * as ctx from "../../__tests__/helpers/fixtures";
import "../../__tests__/useHashFactory";
import example from "../../ontology/example";
import ll from "../../ontology/ll";
import { Type } from "../Type";

function createComponent(id: string): React.ComponentType {
    return () => React.createElement("span", { "data-testid": id });
}

describe("Type component", () => {
    it("renders null when type is not present", () => {
        const opts = ctx.empty();

        const { container } = render(opts.wrapComponent(React.createElement(Type)));

        expect(container.querySelectorAll("[data-testid=\"root\"] > *")).toHaveLength(0);
    });

    it("renders no view when no class matches", () => {
        const opts = ctx.fullCW(undefined);

        const { getByTestId } = render(opts.wrapComponent(React.createElement(Type)));

        expect(getByTestId("no-view")).toBeVisible();
    });

    it("renders error on server errors", () => {
        const subj = example.ns("3");
        const opts = ctx.fullCW(subj);
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createComponent("loading"),
            ll.ErrorResource,
        ));
        (opts.lrs.api as any).setStatus(subj, 500);

        const { getByTestId } = render(opts.wrapComponent(React.createElement(Type)));

        expect(getByTestId("loading")).toBeVisible();
    });

    it("renders default when set", () => {
        const opts = ctx.fullCW();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createComponent("thing"),
            schema.Thing,
        ));

        const { getByTestId } = render(opts.wrapComponent(React.createElement(Type)));

        expect(getByTestId("thing")).toBeVisible();
    });

    it("renders the registered class", () => {
        const opts = ctx.fullCW();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
            createComponent("creativeWork"),
            schema.CreativeWork,
        ));

        const { getByTestId } = render(opts.wrapComponent(React.createElement(Type)));

        expect(getByTestId("creativeWork")).toBeVisible();
    });

    it("renders stale data on reload", () => {
        const opts = ctx.fullCW();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
          createComponent("creativeWork"),
          schema.CreativeWork,
        ));
        opts.lrs.store.getInternalStore().store.journal.transition(opts.subject!.value, RecordState.Present);
        opts.lrs.store.getInternalStore().store.journal.transition(opts.subject!.value, RecordState.Queued);

        const { getByTestId } = render(opts.wrapComponent(React.createElement(Type)));

        expect(getByTestId("creativeWork")).toBeVisible();
    });

    it("renders stale data on clear", () => {
        const opts = ctx.fullCW();
        opts.lrs.registerAll(LinkedRenderStore.registerRenderer(
          createComponent("creativeWork"),
          schema.CreativeWork,
        ));
        opts.lrs.store.getInternalStore().store.journal.transition(opts.subject!.value, RecordState.Present);
        opts.lrs.store.getInternalStore().store.journal.transition(opts.subject!.value, RecordState.Absent);

        const { getByTestId } = render(opts.wrapComponent(React.createElement(Type)));

        expect(getByTestId("root")).toBeEmptyDOMElement();
    });
});
