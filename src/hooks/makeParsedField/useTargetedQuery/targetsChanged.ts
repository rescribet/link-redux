import { equals } from "link-lib";

import { LaxIdentifier } from "../../../types";

type Targets = LaxIdentifier | LaxIdentifier[];

export const targetsChanged = (previous: Targets, next: Targets): boolean => {
  if (previous === next) {
    return false;
  }

  if (previous === undefined || next === undefined) {
    return previous !== next;
  }

  if (Array.isArray(previous) && Array.isArray(next)) {
    return previous.length !== next.length
      || previous.some((p, i) => !equals(p, next[i]));
  }

  if (Array.isArray(previous) || Array.isArray(next)) {
    return true;
  }

  return !equals(previous, next);
};
