import { renderHook } from "@testing-library/react-hooks";

import * as ctx from "../../__tests__/helpers/fixtures";
import { useRenderLoadingOrError } from "../useLoadingOrError";

describe("useRenderLoadingOrError", () => {
  it("returns undefined for valid resources", () => {
    const { subject, wrapper } = ctx.fullCW();
    const { result: { current } } = renderHook(() => useRenderLoadingOrError({ subject: subject! }), { wrapper });

    expect(current).toEqual(undefined);
  });

  it("returns null if an error was passed but no component could be found", () => {
    const { subject, wrapper } = ctx.fullCW();
    const { result: { current } } = renderHook(() => useRenderLoadingOrError(
      { subject: subject! },
      new Error(),
    ), { wrapper });

    expect(current).toEqual(null);
  });
});
