import React, { PropTypes } from 'react';
import { allRDFValues } from 'link-lib';

import linkedSubject from './linkedSubject';
import linkedVersion from './linkedVersion';
import { Property } from '../react/components/index';
import { lrsType, subjectType, topologyType } from '../propTypes';

const propTypes = {
  children: PropTypes.any,
  subject: subjectType,
};

const Type = (props, { linkedRenderStore, topology }) => {
  const objType = allRDFValues(
      linkedRenderStore.tryEntity(props.subject),
      linkedRenderStore.namespaces.rdf('type'),
      true,
    ) || linkedRenderStore.defaultType;
  if (objType === undefined) {
    return null;
  }
  const Klass = linkedRenderStore.getRenderClassForType(objType, topology);
  if (Klass !== undefined) {
    return React.createElement(
      Klass,
      props,
      props.children,
    );
  }
  return React.createElement(
    'div',
    { className: 'no-view' },
    React.createElement(Property, { label: linkedRenderStore.namespaces.schema('name') }),
    React.createElement('p', null, "We currently don't have a view for this"),
  );
};

Type.contextTypes = {
  linkedRenderStore: lrsType,
  topology: topologyType,
};
Type.displayName = 'Type';
Type.propTypes = propTypes;

export default linkedSubject(linkedVersion(Type));
