import hoistNonReactStatics from "hoist-non-react-statics";
import { DataRecord } from "link-lib";
import React from "react";

import { PropertyWrappedProps } from "../../components/Property";
import { useCalculateChildProps } from "../../hooks/useCalculateChildProps";
import { normalizeDataSubjects, useDataInvalidation } from "../../hooks/useDataInvalidation";
import { useLinkedObjectProperties } from "../../hooks/useLinkedObjectProperties";
import { useLinkRenderContext } from "../../hooks/useLinkRenderContext";
import { useLRS } from "../../hooks/useLRS";
import {
  DataToPropsMapping,
  LinkOpts,
  ReturnType,
} from "../../types";

const createConnectedComponent = <P>(
  propMap: DataToPropsMapping,
  opts: LinkOpts,
  wrappedComponent: React.ComponentType<P>,
) => React.forwardRef((props: P & PropertyWrappedProps, ref: React.Ref<unknown>) => {
  const lrs = useLRS();
  const context = useLinkRenderContext();
  const childProps = useCalculateChildProps({ ...props, innerRef: ref}, context, { lrs: true });

  const record = lrs.tryRecord(childProps.subject);
  const records: Array<[string, DataRecord]> = record === undefined ? [] : [[childProps.subject.value, record]];
  const fieldProps = useLinkedObjectProperties(records, propMap, opts.returnType ?? ReturnType.Term);

  const mappedProps = {
    ...childProps,
    ...fieldProps,
    subject: childProps.subject,
  };
  const linkVersion = useDataInvalidation(normalizeDataSubjects(mappedProps));

  if ((props.forceRender || opts.forceRender) !== true && record === undefined) {
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
    opts: LinkOpts,
) => (wrappedComponent: React.ComponentType<P>): React.ComponentType<any> => {
    const comp = createConnectedComponent(propMap, opts, wrappedComponent);
    comp.displayName = `linkMapDataToProps(${comp.displayName || comp.name})`;

    return hoistNonReactStatics(comp, wrappedComponent);
};
