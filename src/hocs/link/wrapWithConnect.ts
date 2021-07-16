import rdf, { Quad } from "@ontologies/core";
import hoistNonReactStatics from "hoist-non-react-statics";
import { id } from "link-lib";
import React from "react";

import { PropertyWrappedProps } from "../../components/Property";
import { useCalculateChildProps } from "../../hooks/useCalculateChildProps";
import { normalizeDataSubjects, useDataInvalidation } from "../../hooks/useDataInvalidation";
import { useLinkedObjectProperties } from "../../hooks/useLinkedObjectProperties";
import { useLinkRenderContext } from "../../hooks/useLinkRenderContext";
import { useLRS } from "../../hooks/useLRS";
import ll from "../../ontology/ll";
import {
  DataToPropsMapping,
  LinkOpts,
  ReturnType,
} from "../../types";

const createConnectedComponent = <P>(
  propMap: DataToPropsMapping,
  requestedProperties: number[],
  opts: LinkOpts,
  wrappedComponent: React.ComponentType<P>,
) => React.forwardRef((props: P & PropertyWrappedProps, ref: React.Ref<unknown>) => {
  const lrs = useLRS();
  const context = useLinkRenderContext();
  const childProps = useCalculateChildProps({ ...props, innerRef: ref}, context, { lrs: true });
  const subjectData = lrs.tryEntity(childProps.subject);

  const subjProps = subjectData.filter((s: Quad) => requestedProperties.includes(id(s.predicate)));
  subjProps.unshift(rdf.quad(childProps.subject, ll.dataSubject, childProps.subject));

  const mappedProps = {
    ...childProps,
    ...useLinkedObjectProperties(subjProps, propMap, opts.returnType ?? ReturnType.Term),
    subject: childProps.subject,
  };

  const linkVersion = useDataInvalidation(normalizeDataSubjects(mappedProps));

  if ((props.forceRender || opts.forceRender) !== true && subjProps.length === 0) {
    return null;
  }

  return React.createElement(
    wrappedComponent,
    {
      ...mappedProps,
      linkVersion,
    },
  );
});

export const wrapWithConnect = <P>(
    propMap: DataToPropsMapping,
    requestedProperties: number[],
    opts: LinkOpts,
) => (wrappedComponent: React.ComponentType<P>): React.ComponentType<any> => {
    const comp = createConnectedComponent(propMap, requestedProperties, opts, wrappedComponent);
    comp.displayName = `linkMapDataToProps(${comp.displayName || comp.name})`;

    return hoistNonReactStatics(comp, wrappedComponent);
};
