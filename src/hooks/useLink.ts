import { LinkOpts, MapDataToPropsParam } from "../types";
import { PropertyBoundProps } from "./useLinkedObjectProperties";

import { useLinkRenderContext } from "./useLinkRenderContext";
import { useResourceLinks } from "./useResourceLinks";

export function useLink(
  dataToProps: MapDataToPropsParam,
  opts: LinkOpts = {},
): PropertyBoundProps<typeof dataToProps> {
  const { subject } = useLinkRenderContext();
  const [data] = useResourceLinks(subject, dataToProps, opts);

  return data;
}
