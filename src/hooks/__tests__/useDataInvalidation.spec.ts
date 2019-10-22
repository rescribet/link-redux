import "../../__tests__/useHashFactory";

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
            expect(normalizeDataSubjects({ subject: defaultNS.example("Tim") }))
                .toEqual([defaultNS.example("Tim")]);
        });

        it("merges dataSubjects with the subject", () => {
            expect(normalizeDataSubjects({
                dataSubjects: [defaultNS.example("Roy")],
                subject: defaultNS.example("Tim"),
            })).toEqual([
                defaultNS.example("Tim"),
                defaultNS.example("Roy"),
            ]);
        });

        it("adds the base document for the subject", () => {
            expect(normalizeDataSubjects({
                subject: defaultNS.example("Tim#me"),
            })).toEqual([
                defaultNS.example("Tim#me"),
                defaultNS.example("Tim"),
            ]);
        });
    });
});
