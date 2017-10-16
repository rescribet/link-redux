import { defaultNS, allRDFValues } from 'link-lib';
import React, { PropTypes } from 'react';

import { expandedProperty, getLinkedObjectProperty } from './PropertyBase';
import linkedSubject from '../../redux/linkedSubject';
import linkedVersion from '../../redux/linkedVersion';
import LOC from '../../redux/LinkedObjectContainer';
import {
  labelType,
  linkedPropType,
  lrsType,
  subjectType,
  topologyType,
} from '../../propTypes';

export const propTypes = {
  label: labelType.isRequired,
  forceRender: PropTypes.bool,
  linkedProp: linkedPropType,
  subject: subjectType,
};
const defaultProps = {
  forceRender: false,
};

export function getLinkedObjectClass(props, { topology, linkedRenderStore }) {
  return linkedRenderStore.getRenderClassForProperty(
    allRDFValues(linkedRenderStore.tryEntity(props.subject), defaultNS.rdf('type'), true),
    expandedProperty(props.label, linkedRenderStore),
    topology,
  );
}

export const PropertyComp = (props, context) => {
  const { forceRender } = props;
  const objRaw = props.linkedProp || getLinkedObjectProperty(
    props.label,
    props.subject,
    context.linkedRenderStore,
    true,
  );
  const obj = objRaw && objRaw.value;
  if (obj === undefined && !forceRender) {
    return null;
  }
  const Klass = getLinkedObjectClass(props, context);
  if (Klass) {
    return React.createElement(Klass, { linkedProp: obj, ...props });
  }
  if (typeof objRaw !== 'undefined' && objRaw.termType === 'NamedNode') {
    return React.createElement(LOC, { object: objRaw.value, ...props });
  }
  if (obj) {
    return React.createElement('div', null, obj);
  }
  return null;
};

PropertyComp.contextTypes = {
  linkedRenderStore: lrsType,
  topology: topologyType,
};
PropertyComp.displayName = 'Property';
PropertyComp.propTypes = propTypes;
PropertyComp.defaultProps = defaultProps;

const ConnectedProp = linkedVersion(PropertyComp);
ConnectedProp.displayName = 'ConnectedProp';

export default linkedSubject(ConnectedProp);
