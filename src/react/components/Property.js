import { defaultNS, allRDFValues } from 'link-lib';
import rdf from 'rdflib';
import React, { PropTypes } from 'react';

import { expandedProperty, getLinkedObjectProperty } from './PropertyBase';
import linkedSubject from '../../redux/linkedSubject';
import linkedVersion from '../../redux/linkedVersion';
import LOC from '../../redux/LinkedObjectContainer';

const nodeShape = PropTypes.shape({
  termType: PropTypes.string,
  value: PropTypes.string,
});
export const propTypes = {
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
    nodeShape,
    PropTypes.arrayOf(nodeShape),
  ]).isRequired,
  forceRender: PropTypes.bool,
  subject: PropTypes.instanceOf(rdf.NamedNode)
};
const defaultProps = {
  forceRender: false,
};

function getLinkedObjectClass(props, { topology, linkedRenderStore }) {
  return linkedRenderStore.getRenderClassForProperty(
    allRDFValues(linkedRenderStore.tryEntity(props.subject), defaultNS.rdf('type'), true),
    expandedProperty(props.label, linkedRenderStore),
    topology
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
    return React.createElement(LOC, { object: objRaw.value });
  }
  if (obj) {
    return React.createElement('div', null, obj);
  }
  return null;
};

PropertyComp.contextTypes = {
  linkedRenderStore: PropTypes.object,
  topology: PropTypes.oneOfType([
    PropTypes.instanceOf(rdf.NamedNode),
    PropTypes.string,
  ]),
};
PropertyComp.displayName = 'Property';
PropertyComp.propTypes = propTypes;
PropertyComp.defaultProps = defaultProps;

const ConnectedProp = linkedVersion(PropertyComp);
ConnectedProp.displayName = 'ConnectedProp';

export default linkedSubject(ConnectedProp);
