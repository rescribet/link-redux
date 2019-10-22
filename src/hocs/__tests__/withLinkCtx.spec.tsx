/* eslint no-magic-numbers: 0 */
import "../../__tests__/useHashFactory";

import { mount } from "enzyme";
import { DEFAULT_TOPOLOGY, defaultNS } from "link-lib";
import * as PropTypes from "prop-types";
import * as React from "react";

import * as ctx from "../../../test/fixtures";
import { LinkContext, LinkCtxOverrides } from "../../types";
import { withLinkCtx } from "../withLinkCtx";

type PropTypes = LinkContext & Partial<LinkCtxOverrides>;

class TestComponent extends React.Component<PropTypes> {
    public render() {
        return null;
    }
}

describe("withLinkCtx hoc", () => {
    it("sets the LinkContextReceiver props", () => {
        const opts = ctx.fullCW();

        const elem = React.createElement(withLinkCtx(TestComponent));
        const tree = mount(opts.wrapComponent(elem));
        const node = tree.find("TestComponent");

        expect(node).toHaveProp("subject", opts.subject);
        expect(node).toHaveProp("topology", DEFAULT_TOPOLOGY);

        expect(node).not.toHaveProp("subjectCtx");
        expect(node).not.toHaveProp("topologyCtx");
    });

    describe("with options", () => {
        it("allows overriding subject", () => {
            const opts = ctx.fullCW();

            const Comp = withLinkCtx(TestComponent, { subject: true, lrs: true });
            const elem = <Comp subject={defaultNS.ex("override")} />;
            const tree = mount(opts.wrapComponent(elem));
            const node = tree.find("TestComponent");

            // enzyme-matchers' `toHaveProps` does a slow recursive deep compare
            expect((node.props() as any).lrs).toEqual(opts.lrs);
            expect(node).toHaveProp("subject", defaultNS.ex("override"));
            expect(node).toHaveProp("topology", DEFAULT_TOPOLOGY);

            expect(node).toHaveProp("subjectCtx", opts.subject);
            expect(node).not.toHaveProp("topologyCtx");
        });

        it("allows overriding topology", () => {
            const opts = ctx.fullCW();

            const Comp = withLinkCtx(TestComponent, { topology: true, lrs: true });
            const elem = <Comp topology={defaultNS.ex("override")} />;
            const tree = mount(opts.wrapComponent(elem));
            const node = tree.find("TestComponent");

            expect((node.props() as any).lrs).toEqual(opts.lrs);
            expect(node).toHaveProp("subject", opts.subject);
            expect(node).toHaveProp("topology", defaultNS.ex("override"));

            expect(node).not.toHaveProp("subjectCtx");
            expect(node).toHaveProp("topologyCtx", DEFAULT_TOPOLOGY);
        });

        it("defaults the topology", () => {
            const opts = ctx.fullCW();

            const Comp = withLinkCtx(TestComponent, { topology: true, lrs: true });
            const tree = mount(opts.wrapComponent(<Comp topology={null} />));
            const node = tree.find("TestComponent");

            expect((node.props() as any).lrs).toEqual(opts.lrs);
            expect(node).toHaveProp("topology", DEFAULT_TOPOLOGY);
        });

        it("adds the helpers", () => {
            const opts = ctx.fullCW();
            const getEntity = jest.fn();
            const lrs = new Proxy(opts.lrs, {
                get(obj, prop) {
                    return prop === "getEntity" ? getEntity : obj[prop];
                },
            });

            const reset = () => undefined;
            const Comp = withLinkCtx(TestComponent, { helpers: { reset } });
            const tree = mount(opts.wrapComponent(<Comp topology={null} />, undefined, lrs));
            const node = tree.find("TestComponent");

            expect(node).toHaveProp("topology", DEFAULT_TOPOLOGY);
            expect(node).toHaveProp("reloadLinkedObject");
            expect(node).toHaveProp("reset", reset);
            const rlo = (node.props() as any).reloadLinkedObject;
            expect(rlo).toBeInstanceOf(Function);
            expect(getEntity).not.toHaveBeenCalled();
            rlo();
            expect(getEntity).toHaveBeenCalledWith(opts.subject, { reload: true });
        });
    });
});
