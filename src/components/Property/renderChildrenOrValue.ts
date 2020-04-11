import rdfFactory, { SomeTerm, TermType } from "@ontologies/core";
import rdfs from "@ontologies/rdfs";
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
    const literalRenderer = lrs.getComponentForProperty(
      rdfs.Literal,
      rdfFactory.namedNode(p.datatype.value),
      topology === null ? undefined : topology || topologyCtx,
    );

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
