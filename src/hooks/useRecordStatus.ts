import { RecordState, RecordStatus, SomeNode } from "link-lib";
import React from "react";

import { useDataInvalidation } from "./useDataInvalidation";
import { useLinkRenderContext } from "./useLinkRenderContext";
import { useLRS } from "./useLRS";

export function isBackgroundLoading(status: RecordStatus): boolean {
  const { current, previous } = status;

  return current !== RecordState.Present && (previous === RecordState.Present && current !== RecordState.Absent);
}

export function isFullyLoaded(status: RecordStatus): boolean {
  return status.current === RecordState.Present;
}

export const useRecordStatus = (id: SomeNode | undefined = undefined): RecordStatus => {
  const lrs = useLRS();
  const { subject } = useLinkRenderContext();
  const target = id ?? subject;

  const [status, setStatus] = React.useState(() => lrs.getState(target.value));
  const update = useDataInvalidation(target);

  React.useEffect(() => {
    setStatus(lrs.getState(target.value));
  }, [target, update]);

  return status;
};
