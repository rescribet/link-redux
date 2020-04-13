import {
  defaultLinkOptions,
  LaxNode,
  LinkedDataObject,
  LinkOpts,
  MapDataToPropsParam,
  TermOpts,
} from "../types";

import { useResourceLinks } from "./useResourceLinks";

export function useResourceLink<
  T extends MapDataToPropsParam = {},
  D extends LinkOpts = TermOpts,
>(
  subject: LaxNode,
  dataToProps: T,
  opts?: D,
): LinkedDataObject<T, typeof opts> {
  const [data] = useResourceLinks(subject, dataToProps, opts || defaultLinkOptions as D);

  return data;
}
