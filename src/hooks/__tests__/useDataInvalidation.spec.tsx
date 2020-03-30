import "../../__tests__/useHashFactory";

import { SubscriptionRegistrationBase } from "link-lib/dist-types/types";
import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import example from "../../ontology/example";

import { DataInvalidationProps } from "../../types";
import { normalizeDataSubjects, useDataInvalidation } from "../useDataInvalidation";

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

    describe("data invalidation", () => {
      let container: HTMLElement | undefined;

      beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
      });

      afterEach(() => {
        document.body.removeChild(container!);
        container = undefined;
      });

      it("updates with data updates", () => {
        const iri = example.ns("");
        const opts = ctx.fullCW();

        const cb: Array<(_: any, u: number) => void> = [];
        const subscribe = jest.fn((o: SubscriptionRegistrationBase<any>) => {
          cb.push(o.callback);

          return () => undefined;
        });
        opts.lrs.subscribe = subscribe;

        const UpdateComp = () => {
          // @ts-ignore
          const lastUpdate = useDataInvalidation({ dataSubjects: [iri] });

          return <div id="update">{lastUpdate}</div>;
        };

        act(() => {
          // @ts-ignore
          ReactDOM.render(opts.wrapComponent(<UpdateComp />), container);
        });

        act(() => {
          cb.map((f) => f(undefined, 1234));
        });
        expect(container!.querySelector("#update")!.textContent).toBe("1234");
      });
    });
});
