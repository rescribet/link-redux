import { RecordState, RecordStatus } from "link-lib";
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

export const useRecordStatus = (): RecordStatus => {
  const lrs = useLRS();
  const { subject } = useLinkRenderContext();
  const [status, setStatus] = React.useState(() => lrs.getState(subject.value));
  const update = useDataInvalidation(subject);

  React.useEffect(() => {
    setStatus(lrs.getState(subject.value));
  }, [subject, update]);

  return status;
};
