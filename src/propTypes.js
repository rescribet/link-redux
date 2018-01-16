import LinkedRenderStore from 'link-lib';
import PropTypes from 'prop-types';
import rdf from 'rdflib';

export const linkType = PropTypes.oneOfType([
  PropTypes.instanceOf(rdf.NamedNode),
  PropTypes.instanceOf(rdf.BlankNode),
]);

export const labelType = PropTypes.oneOfType([
  PropTypes.instanceOf(rdf.NamedNode),
  PropTypes.arrayOf(PropTypes.instanceOf(rdf.NamedNode)),
]);
export const linkedPropType = PropTypes.oneOfType([
  PropTypes.instanceOf(rdf.NamedNode),
  PropTypes.instanceOf(rdf.BlankNode),
  PropTypes.instanceOf(rdf.Literal),
]);
export const lrsType = PropTypes.instanceOf(LinkedRenderStore);
export const subjectType = linkType;
export const topologyType = linkType;
