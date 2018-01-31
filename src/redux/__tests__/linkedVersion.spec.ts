/* eslint no-magic-numbers: 0 */
import { mount } from "enzyme";
import { defaultNS } from "link-lib";
import { createElement } from "react";

import * as ctx from "../../../test/fixtures";
import { linkedModelTouch } from "../linkedObjects/actions";
import { linkedVersion } from "../linkedVersion";

const testSubject = defaultNS.example("0");

describe("linkedVersion component", () => {
    it("raises without subject", () => {
        const opts = ctx.empty();
        const comp = linkedVersion(() => null);
        let caught = false;
        try {
            mount(
                opts.wrapComponent(createElement(comp)),
            );
        } catch (e) {
            caught = true;
        }
        expect(caught).toEqual(true);
    });

    it("does not raise with a subject", () => {
        const opts = ctx.empty();
        const comp = linkedVersion(() => null);
        let caught = false;
        try {
            mount(
                opts.wrapComponent(createElement(comp, { subject: "http://example.org/1" })),
            );
        } catch (e) {
            caught = true;
        }

        expect(caught).toEqual(false);
    });

    it("adds the version", () => {
        const opts = ctx.empty(testSubject);
        const comp = linkedVersion(() => createElement("p", null, "test"));
        const action = linkedModelTouch([testSubject]);
        opts.reduxStore.dispatch(action);
        const elem = mount(
            opts.wrapComponent(createElement(comp, { subject: testSubject })),
        );

        expect(elem.find({ subject: testSubject }).last())
            .toHaveProp("version", action.payload[testSubject]);
    });
});
