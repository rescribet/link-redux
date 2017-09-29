import LinkedRenderStore from 'link-lib';
import PropTypes from 'prop-types';
import rdf from 'rdflib';

export const labelType = PropTypes.oneOfType([
  PropTypes.instanceOf(rdf.NamedNode),
  PropTypes.arrayOf(PropTypes.instanceOf(rdf.NamedNode)),
]);
export const linkedPropType = PropTypes.oneOfType([
  PropTypes.object,
  PropTypes.string,
]);
export const lrsType = PropTypes.instanceOf(LinkedRenderStore);
export const subjectType = PropTypes.instanceOf(rdf.NamedNode);
export const topologyType = PropTypes.instanceOf(rdf.NamedNode);
