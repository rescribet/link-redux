import { defaultNS } from "link-lib";

import { DataInvalidationProps } from "../../types";
import { normalizeDataSubjects } from "../useDataInvalidation";

describe("useDataInvalidation", () => {
    describe("normalizeDataSubjects", () => {
        it("handles empty objects", () => {
            expect(normalizeDataSubjects({} as DataInvalidationProps))
                .toHaveLength(0);
        });

        it("makes an array from the subject", () => {
            expect(normalizeDataSubjects({ subject: defaultNS.ex("Tim") }))
                .toEqual([defaultNS.ex("Tim")]);
        });

        it("merges dataSubjects with the subject", () => {
            expect(normalizeDataSubjects({
                dataSubjects: [defaultNS.ex("Roy")],
                subject: defaultNS.ex("Tim"),
            })).toEqual([
                defaultNS.ex("Tim"),
                defaultNS.ex("Roy"),
            ]);
        });
    });
});
