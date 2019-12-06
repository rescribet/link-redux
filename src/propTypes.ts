import { LinkedRenderStore } from "link-lib";
import PropTypes from "prop-types";

const BlankNode = PropTypes.shape({
  termType: PropTypes.oneOf(["BlankNode"]),
  value: PropTypes.string,
});

const NamedNode = PropTypes.shape({
  termType: PropTypes.oneOf(["NamedNode"]),
  value: PropTypes.string,
});

const Literal = PropTypes.shape({
  datatype: NamedNode,
  language: PropTypes.string,
  termType: PropTypes.oneOf(["Literal"]),
  value: PropTypes.string,
});

const Statement = PropTypes.shape({
  subject: PropTypes.oneOfType([BlankNode, NamedNode]),

  predicate: PropTypes.oneOfType([BlankNode, NamedNode]),

  object: PropTypes.oneOfType([BlankNode, NamedNode, Literal]),

  graph: PropTypes.oneOfType([BlankNode, NamedNode]),
});

const namedOrBlankNode = PropTypes.oneOfType([
    NamedNode,
    BlankNode,
]);

export const linkType = PropTypes.oneOfType([
    NamedNode,
    BlankNode,
    Literal,
    Statement,
    PropTypes.string,
    PropTypes.arrayOf(NamedNode),
    PropTypes.arrayOf(BlankNode),
    PropTypes.arrayOf(Literal),
    PropTypes.arrayOf(Statement),
    PropTypes.arrayOf(PropTypes.string),
]);

export const labelType = PropTypes.oneOfType([
    NamedNode,
    PropTypes.arrayOf(NamedNode),
]);
export const linkedPropType = PropTypes.oneOfType([
    NamedNode,
    BlankNode,
    Literal,
]);
export const lrsType = PropTypes.instanceOf(LinkedRenderStore);
export const subjectType = namedOrBlankNode;
export const topologyType = namedOrBlankNode;
