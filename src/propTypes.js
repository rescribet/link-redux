import LinkedRenderStore from 'link-lib';
import PropTypes from 'prop-types';
import rdf from 'rdflib';

export const nodeType = PropTypes.oneOfType([
  PropTypes.instanceOf(rdf.NamedNode),
  PropTypes.instanceOf(rdf.BlankNode),
]);

export const labelType = PropTypes.oneOfType([
  PropTypes.instanceOf(rdf.NamedNode),
  PropTypes.arrayOf(PropTypes.instanceOf(rdf.NamedNode)),
]);
export const linkedPropType = nodeType;
export const lrsType = PropTypes.instanceOf(LinkedRenderStore);
export const subjectType = nodeType;
export const topologyType = nodeType;
