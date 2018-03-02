/* eslint no-magic-numbers: 0 */
import { mount } from "enzyme";
import { defaultNS } from "link-lib";
import { createElement } from "react";

import * as ctx from "../../../test/fixtures";
import { SubjectProp } from "../../types";
import { linkedModelTouch } from "../linkedObjects/actions";
import { linkedVersion, mapStateToProps } from "../linkedVersion";

const testSubject = defaultNS.example("0");

describe("linkedVersion component", () => {
    it("raises without subject", () => {
        let caught: Error | undefined;
        try {
            mapStateToProps(new Map(), {} as SubjectProp);
        } catch (e) {
            caught = e;
        }
        expect(caught).toBeTruthy();
        expect(caught!.message).toEqual("[LS] A subject must be given");
    });

    it("does not raise with a subject", () => {
        const opts = ctx.empty();
        const comp = linkedVersion(() => null);
        let caught = false;
        try {
            mapStateToProps(new Map(), { subject: defaultNS.example("1") });
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
