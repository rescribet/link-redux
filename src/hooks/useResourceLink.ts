import { Node } from "@ontologies/core";
import { LinkOpts, MapDataToPropsParam } from "../types";
import { PropertyBoundProps } from "./useLinkedObjectProperties";

import { useResourceLinks } from "./useResourceLinks";

export function useResourceLink(
  subject: Node,
  dataToProps: MapDataToPropsParam,
  opts: LinkOpts = {},
): PropertyBoundProps<typeof dataToProps> {
  const [data] = useResourceLinks(subject, dataToProps, opts);

  return data;
}
