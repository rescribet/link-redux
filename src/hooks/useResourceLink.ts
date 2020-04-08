import {
  LaxNode,
  LinkedDataObject,
  LinkOpts,
  MapDataToPropsParam,
  OutputFromReturnType, OutputTypeFromOpts,
  ReturnType,
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
): LinkedDataObject<T, typeof opts> & { subject: OutputTypeFromOpts<D> extends never ? ReturnType.Term : OutputTypeFromOpts<D> } {
  const [data] = useResourceLinks(subject, dataToProps, opts);

  return data;
}
