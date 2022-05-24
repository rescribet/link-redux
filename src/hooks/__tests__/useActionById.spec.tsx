import "../../__tests__/useHashFactory";

import rdf from "@ontologies/core";
import { renderHook } from "@testing-library/react-hooks";
import { createStore } from "link-lib";
import React, { PropsWithChildren } from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import * as ctx from "../../__tests__/helpers/fixtures";
import { RenderStoreProvider } from "../../components/RenderStoreProvider";
import ex from "../../ontology/ex";
import { useActionById } from "../useActionById";

describe("useActionById", () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container!);
    container = undefined;
  });

  const wrapper = ({ children }: PropsWithChildren<never>) => (
    <RenderStoreProvider value={createStore()}>
      {children}
    </RenderStoreProvider>
  );

  it("return undefined when executing undefined", () => {
    const { result } = renderHook(() => useActionById(undefined), { wrapper });

    return expect(result.current).toEqual(undefined);
  });

  it("return undefined when executing literal", () => {
    const { result } = renderHook(() => useActionById(rdf.literal("test")), { wrapper });

    return expect(result.current).toEqual(undefined);
  });

  it("executes by iri", async () => {
    const opts = ctx.fullCW();

    const comp = () => {
      const [v, setV] = React.useState<string | null>(null);
      const action = useActionById(ex.ns("a"));

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
});
