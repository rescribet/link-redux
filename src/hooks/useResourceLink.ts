import {
  LaxNode,
  LinkedDataObject,
  LinkOpts,
  MapDataToPropsParam,
  SingleTermOpts,
} from "../types";

import { useResourceLinks } from "./useResourceLinks";

export function useResourceLink<
  T extends MapDataToPropsParam = {},
  D extends LinkOpts = SingleTermOpts,
>(
  subject: LaxNode,
  dataToProps: T,
  opts: D,
): LinkedDataObject<T, typeof opts> {
  const [data] = useResourceLinks(subject, dataToProps, opts);

  return data;
}
