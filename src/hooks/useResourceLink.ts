import {
  LaxNode,
  LinkedDataObject,
  LinkOpts,
  MapDataToPropsParam,
  ReturnType,
} from "../types";

import { useResourceLinks } from "./useResourceLinks";

export function useResourceLink<
  T extends MapDataToPropsParam = {},
  D extends LinkOpts = { returnType: ReturnType.Term },
>(
  subject: LaxNode,
  dataToProps: T,
  opts?: D,
): LinkedDataObject<T, typeof opts> {
  const [data] = useResourceLinks(subject, dataToProps, opts);

  return data;
}
