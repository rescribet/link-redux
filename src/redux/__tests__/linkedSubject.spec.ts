/* eslint no-magic-numbers: 0 */
import { shallow } from "enzyme";
import { defaultNS, SomeNode } from "link-lib";
import * as PropTypes from "prop-types";
import { createElement } from "react";

import { linkedSubject } from "../linkedSubject";

const testSubject = defaultNS.example("resource/8");

const shallowCtx = (subject: SomeNode) => ({
    context: {
        subject,
    },
    contextTypes: {
        subject: PropTypes.object,
    },
});

describe("linkedSubject component", () => {
    it("sets the inner subject type", () => {
        const comp = linkedSubject(() => null);

        expect(comp).toHaveProperty("contextTypes");
        expect(comp.contextTypes).toHaveProperty("subject");
    });

    it("sets the inner display name", () => {
        const comp = linkedSubject(() => null);

        expect(comp).toHaveProperty("displayName", "linkedSubject[]");
    });

    it("adds the subject", () => {
        const comp = linkedSubject(() => createElement("p", null, "test"));
        const elem = shallow(
            createElement(comp),
            shallowCtx(testSubject),
        );

        expect(elem).toHaveProp("subject", testSubject);
    });

    it("replaces the subject", () => {
        const comp = linkedSubject(() => createElement("p", null, "test"));
        const elem = shallow(
            createElement(comp, { subject: null }),
            shallowCtx(testSubject),
        );

        expect(elem).toHaveProp("subject", testSubject);
    });
});
