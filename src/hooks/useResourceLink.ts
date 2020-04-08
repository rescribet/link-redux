import {
  LaxNode,
  LinkOpts,
  MapDataToPropsParam,
  OutputTypeFromOpts,
  PropertyBoundProps,
  TermOpts,
} from "../types";

import { useResourceLinks } from "./useResourceLinks";

export function useResourceLink<
  T extends MapDataToPropsParam = {},
  D extends LinkOpts = TermOpts,
>(
  subject: LaxNode,
  dataToProps: T,
  opts: D,
): PropertyBoundProps<
    T,
    OutputTypeFromOpts<typeof opts>
  > {
  const [data] = useResourceLinks(subject, dataToProps, opts);

  return data;
}
