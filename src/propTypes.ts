import { LinkedRenderStore } from "link-lib";
import * as ReactPropTypes from "prop-types";

const BlankNode = ReactPropTypes.shape({
  termType: ReactPropTypes.oneOf(["BlankNode"]),
  value: ReactPropTypes.string,
});

const NamedNode = ReactPropTypes.shape({
  termType: ReactPropTypes.oneOf(["NamedNode"]),
  value: ReactPropTypes.string,
});

const Literal = ReactPropTypes.shape({
  datatype: NamedNode,
  language: ReactPropTypes.string,
  termType: ReactPropTypes.oneOf(["Literal"]),
  value: ReactPropTypes.string,
});

const Statement = ReactPropTypes.shape({
  subject: ReactPropTypes.oneOfType([BlankNode, NamedNode]),

  predicate: ReactPropTypes.oneOfType([BlankNode, NamedNode]),

  object: ReactPropTypes.oneOfType([BlankNode, NamedNode, Literal]),

  graph: ReactPropTypes.oneOfType([BlankNode, NamedNode]),
});

const namedOrBlankNode = ReactPropTypes.oneOfType([
    NamedNode,
    BlankNode,
]);

export const linkType = ReactPropTypes.oneOfType([
    NamedNode,
    BlankNode,
    Literal,
    Statement,
    ReactPropTypes.string,
    ReactPropTypes.arrayOf(NamedNode),
    ReactPropTypes.arrayOf(BlankNode),
    ReactPropTypes.arrayOf(Literal),
    ReactPropTypes.arrayOf(Statement),
    ReactPropTypes.arrayOf(ReactPropTypes.string),
]);

export const labelType = ReactPropTypes.oneOfType([
    NamedNode,
    ReactPropTypes.arrayOf(NamedNode),
]);
export const linkedPropType = ReactPropTypes.oneOfType([
    NamedNode,
    BlankNode,
    Literal,
]);
export const lrsType = ReactPropTypes.instanceOf(LinkedRenderStore);
export const subjectType = namedOrBlankNode;
export const topologyType = namedOrBlankNode;
