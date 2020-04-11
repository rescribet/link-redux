import {
  LinkedDataObject,
  LinkOpts,
  MapDataToPropsParam,
  TermOpts,
} from "../types";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useResourceLinks } from "./useResourceLinks";

export function useLink<
  T extends MapDataToPropsParam = MapDataToPropsParam,
  D extends LinkOpts = TermOpts,
>(
  dataToProps: T,
  opts: LinkOpts = {},
): LinkedDataObject<T, D> {
  const { subject } = useLinkRenderContext();
  const [data] = useResourceLinks(subject, dataToProps, opts);

  return data;
}
