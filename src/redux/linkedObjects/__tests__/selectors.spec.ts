/* eslint no-magic-numbers: 0 */
import { Map } from "immutable";
import { defaultNS as NS } from "link-lib";

import { linkedObjectVersionByIRI } from "../selectors";

const state = new Map().set(
    "linkedObjects",
    {
        [NS.example("resource/1").toString()]: "6qqyb",
    },
);

describe("linkedObjects selector", () => {
    describe("linkedObjectVersionByIRI", () => {
        it("returns the version", () => {
            expect(linkedObjectVersionByIRI(state, NS.example("resource/1")))
                .toEqual("6qqyb");
        });
    });
});
