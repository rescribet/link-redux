import "../../__tests__/useHashFactory";

import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import ex from "../../ontology/ex";
import { useAction } from "../useAction";

describe("useAction", () => {
    let container: HTMLElement | undefined;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container!);
      container = undefined;
    });

    it("executes by iri", async () => {
      const opts = ctx.fullCW();

      const comp = () => {
        const [v, setV] = React.useState<string | null>(null);
        const action = useAction(ex.ns("a"));

        React.useEffect(() => {
          action().then((res) => setV(res));
        }, [action]);

        return React.createElement("p", { id: "test" }, v);
      };

      await act(async () => {
        // @ts-ignore
        ReactDOM.render(opts.wrapComponent(React.createElement(comp)), container);
      });

      expect(container!.querySelector("#test")!.textContent).toBe("a");
    });

    it("executes prebound by path", async () => {
      const opts = ctx.fullCW();

      const comp = () => {
        const [v, setV] = React.useState<string | null>(null);
        const action = useAction("test.execB");

        React.useEffect(() => {
          action().then((res) => setV(res));
        }, [action]);

        return React.createElement("p", { id: "test" }, v);
      };

      await act(async () => {
        // @ts-ignore
        ReactDOM.render(opts.wrapComponent(React.createElement(comp)), container);
      });

      expect(container!.querySelector("#test")!.textContent).toBe("b");
    });
});
