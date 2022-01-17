import { isTerm } from "@ontologies/core";
import { equals } from "link-lib";
import { DigQuery, ExceptQuery, Query, QueryType } from "../types";

export const queryChanged = (previous: Query, next: Query) => {
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

  if (isTerm(previous) || isTerm(next)) {
    return !equals(previous, next);
  }

  if (previous.type !== next.type) {
    return true;
  }

  switch (previous.type) {
    case QueryType.Dig:
      return previous.path.length !== (next as DigQuery).path.length
        || previous.path.some((p, i) => {
          const nextPath = (next as DigQuery).path[i];
          if (isTerm(p)) {
            return !equals(p, nextPath);
          } else {
            return Array.isArray(nextPath)
              ? p.some((path, ip) => !equals(path, nextPath[ip]))
              : true;
          }
        });
    case QueryType.Array:
    case QueryType.Except:
      return previous.fields.length !== (next as ExceptQuery).fields.length
        || previous.fields.some((p, i) => !equals(p, (next as ExceptQuery).fields[i]));
  }
};
