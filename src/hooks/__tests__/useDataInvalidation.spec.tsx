import "../../__tests__/useHashFactory";

import rdfFactory, { NamedNode } from "@ontologies/core";
import { render } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { SubscriptionRegistrationBase } from "link-lib";
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

      it("handles literals", () => {
        const { wrapper } = ctx.fullCW();
        const { result: { current } } = renderHook(() => useDataInvalidation(rdfFactory.literal("")), { wrapper });

        expect(current).toEqual(0);
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
          const lastUpdate = useDataInvalidation(iri);

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

      it("invalidates after resource removal", () => {
        const firstId = example.ns("3");
        let idCounter = 1;
        const opts = ctx.fullCW(firstId);

        const Comp = ({ resource }: { resource: NamedNode | undefined }) => {
          const id = React.useRef(idCounter++);
          const lastUpdate = useDataInvalidation(resource);

          return (
            <div>
              <div data-testid="update">{lastUpdate}</div>
              <span data-testid="instance-id">{id.current}</span>
            </div>
          );
        };

        const { getByTestId, rerender } = render(<Comp resource={firstId} />, { wrapper: opts.wrapper });

        const firstUpdate = Number(getByTestId("update").textContent);
        expect(getByTestId("instance-id")).toHaveTextContent("1");

        act(() => {
          opts.lrs.removeResource(firstId, true);
        });

        rerender(<Comp resource={firstId} />);

        const secondUpdate = Number(getByTestId("update").textContent);
        expect(secondUpdate).toBeGreaterThan(firstUpdate);
        expect(getByTestId("instance-id")).toHaveTextContent("1");
      });
    });
});
