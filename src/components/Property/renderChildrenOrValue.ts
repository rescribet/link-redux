import rdf, { SomeTerm, TermType } from "@ontologies/core";
import * as rdfs from "@ontologies/rdfs";
import { RENDER_CLASS_NAME } from "link-lib";
import React from "react";

import { LinkReduxLRSType } from "../../types";
import { PropertyWrappedProps } from "../Property";

export function renderChildrenOrValue(props: PropertyWrappedProps, lrs: LinkReduxLRSType):
  (p: SomeTerm) => React.ReactNode {

  return function(p: SomeTerm): React.ReactNode {
    if (props.children || p.termType !== TermType.Literal) {
      return React.createElement(React.Fragment, null, props.children || p.value);
    }

    const { topology, topologyCtx, subjectCtx } = props;
    const t = topology === null ? undefined : topology || topologyCtx;
    const literalRenderer = lrs.getComponentForProperty(rdfs.Literal, rdf.namedNode(p.datatype.value), t)
      || lrs.getComponentForProperty(rdfs.Literal, RENDER_CLASS_NAME, t);

    if (!literalRenderer) {
      return React.createElement(React.Fragment, null, p.value);
    }

    return React.createElement(
      literalRenderer,
      {
        linkedProp: p,
        subject: p.datatype,
        subjectCtx,
        topology,
        topologyCtx,
      },
    );
  };
}
