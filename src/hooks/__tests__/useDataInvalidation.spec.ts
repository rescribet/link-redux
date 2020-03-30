import "../../__tests__/useHashFactory";

import example from "../../ontology/example";

import { DataInvalidationProps } from "../../types";
import { normalizeDataSubjects } from "../useDataInvalidation";

describe("useDataInvalidation", () => {
    describe("normalizeDataSubjects", () => {
        it("handles empty objects", () => {
            expect(normalizeDataSubjects({} as DataInvalidationProps))
                .toHaveLength(0);
        });

        it("makes an array from the subject", () => {
            expect(normalizeDataSubjects({ subject: example.ns("Tim") }))
                .toEqual([example.ns("Tim")]);
        });

        it("merges dataSubjects with the subject", () => {
            expect(normalizeDataSubjects({
                dataSubjects: [example.ns("Roy")],
                subject: example.ns("Tim"),
            })).toEqual([
                example.ns("Tim"),
                example.ns("Roy"),
            ]);
        });

        it("adds the base document for the subject", () => {
            expect(normalizeDataSubjects({
                subject: example.ns("Tim#me"),
            })).toEqual([
                example.ns("Tim#me"),
                example.ns("Tim"),
            ]);
        });
    });
});
