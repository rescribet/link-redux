/* eslint no-magic-numbers: 0 */
import { mount } from "enzyme";
import { DEFAULT_TOPOLOGY, defaultNS, SomeNode } from "link-lib";
import * as PropTypes from "prop-types";
import * as React from "react";

import * as ctx from "../../../test/fixtures";
import { LinkContext, LinkCtxOverrides } from "../../types";
import { withLinkCtx } from "../withLinkCtx";

const testSubject = defaultNS.example("resource/8");

const shallowCtx = (subject: SomeNode) => ({
    context: {
        subject,
    },
    contextTypes: {
        subject: PropTypes.object,
    },
});

interface PropTypes extends LinkContext, Partial<LinkCtxOverrides> {
    type: any;
}

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

            expect(node).toHaveProp("lrs", opts.lrs);
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

            expect(node).toHaveProp("lrs", opts.lrs);
            expect(node).toHaveProp("subject", opts.subject);
            expect(node).toHaveProp("topology", defaultNS.ex("override"));

            expect(node).not.toHaveProp("subjectCtx");
            expect(node).toHaveProp("topologyCtx", DEFAULT_TOPOLOGY);
        });
    });
});
