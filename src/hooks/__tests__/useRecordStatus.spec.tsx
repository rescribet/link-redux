import "../../__tests__/useHashFactory";

import { act, renderHook } from "@testing-library/react-hooks";
import { RecordState } from "link-lib";

import * as ctx from "../../__tests__/helpers/fixtures";
import { isBackgroundLoading, isFullyLoaded, useRecordStatus } from "../useRecordStatus";

describe("useRecordStatus", () => {
  it("isBackgroundLoading when current state is not absent nor present and previous is not absent", () => {
    expect(isBackgroundLoading({
      current: RecordState.Queued,
      lastUpdate: 0,
      previous: RecordState.Present,
    })).toBeTruthy();
    expect(isBackgroundLoading({
      current: RecordState.Requested,
      lastUpdate: 0,
      previous: RecordState.Present,
    })).toBeTruthy();
    expect(isBackgroundLoading({
      current: RecordState.Receiving,
      lastUpdate: 0,
      previous: RecordState.Present,
    })).toBeTruthy();

    expect(isBackgroundLoading({
      current: RecordState.Present,
      lastUpdate: 0,
      previous: RecordState.Absent,
    })).toBeFalsy();
    expect(isBackgroundLoading({
      current: RecordState.Present,
      lastUpdate: 0,
      previous: RecordState.Receiving,
    })).toBeFalsy();
  });

  it("isFullyLoaded when current state is present", () => {
    expect(isFullyLoaded({
      current: RecordState.Present,
      lastUpdate: 0,
      previous: RecordState.Absent,
    })).toBeTruthy();

    expect(isFullyLoaded({
      current: RecordState.Receiving,
      lastUpdate: 0,
      previous: RecordState.Present,
    })).toBeFalsy();
  });

  it("gets the status of existing record", () => {
    const { subject, wrapper } = ctx.empty();

    const { result: { current: { current, previous } } } = renderHook(() => useRecordStatus(subject), { wrapper });

    expect(previous).toBe(RecordState.Absent);
    expect(current).toBe(RecordState.Absent);
  });

  it("gets the status of existing record", () => {
    const { lrs, subject, wrapper } = ctx.fullCW();
    lrs.store.getInternalStore().store.journal.transition(subject!.value, RecordState.Absent);
    lrs.store.getInternalStore().store.journal.transition(subject!.value, RecordState.Present);

    const { result: { current: { current, previous } } } = renderHook(() => useRecordStatus(), { wrapper });

    expect(previous).toBe(RecordState.Absent);
    expect(current).toBe(RecordState.Present);
  });

  it("gets the status of loading record", () => {
    const { lrs, subject, wrapper } = ctx.fullCW();
    lrs.store.getInternalStore().store.journal.transition(subject!.value, RecordState.Absent);
    lrs.store.getInternalStore().store.journal.transition(subject!.value, RecordState.Queued);

    const { result: { current: { current, previous } } } = renderHook(() => useRecordStatus(), { wrapper });

    expect(previous).toBe(RecordState.Absent);
    expect(current).toBe(RecordState.Queued);
  });

  it("updates the status of loading record", async () => {
    const { lrs, subject, wrapper } = ctx.fullCW();
    lrs.store.getInternalStore().store.journal.transition(subject!.value, RecordState.Absent);
    lrs.store.getInternalStore().store.journal.transition(subject!.value, RecordState.Queued);

    const { rerender, result } = renderHook(() => useRecordStatus(), { wrapper });

    expect(result.current.previous).toBe(RecordState.Absent);
    expect(result.current.current).toBe(RecordState.Queued);

    await act(() => {
      lrs.store.getInternalStore().store.journal.transition(subject!.value, RecordState.Requested);

      return (lrs as any).broadcast();
    });
    rerender();

    expect(result.current.previous).toBe(RecordState.Queued);
    expect(result.current.current).toBe(RecordState.Requested);
  });
});
