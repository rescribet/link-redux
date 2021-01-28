import * as rdfs from "@ontologies/rdfs";
import React from "react";

import { SubjectProp } from "../types";

export class Component<P = {}> extends React.Component<P & SubjectProp> {
  public static type = rdfs.Resource;
}
