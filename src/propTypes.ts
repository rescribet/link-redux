import { LinkedRenderStore } from "link-lib";
import * as ReactPropTypes from "prop-types";
import {
    BlankNode,
    Literal,
    NamedNode,
    Statement,
} from "rdflib";

const namedOrBlankNode = ReactPropTypes.oneOfType([
    ReactPropTypes.instanceOf(NamedNode),
    ReactPropTypes.instanceOf(BlankNode),
]);

export const linkType = ReactPropTypes.oneOfType([
    ReactPropTypes.instanceOf(NamedNode),
    ReactPropTypes.instanceOf(BlankNode),
    ReactPropTypes.instanceOf(Literal),
    ReactPropTypes.instanceOf(Statement),
    ReactPropTypes.string,
    ReactPropTypes.arrayOf(ReactPropTypes.instanceOf(NamedNode)),
    ReactPropTypes.arrayOf(ReactPropTypes.instanceOf(BlankNode)),
    ReactPropTypes.arrayOf(ReactPropTypes.instanceOf(Literal)),
    ReactPropTypes.arrayOf(ReactPropTypes.instanceOf(Statement)),
    ReactPropTypes.arrayOf(ReactPropTypes.string),
]);

export const labelType = ReactPropTypes.oneOfType([
    ReactPropTypes.instanceOf(NamedNode),
    ReactPropTypes.arrayOf(ReactPropTypes.instanceOf(NamedNode)),
]);
export const linkedPropType = ReactPropTypes.oneOfType([
    ReactPropTypes.instanceOf(NamedNode),
    ReactPropTypes.instanceOf(BlankNode),
    ReactPropTypes.instanceOf(Literal),
]);
export const lrsType = ReactPropTypes.instanceOf(LinkedRenderStore);
export const subjectType = namedOrBlankNode;
export const topologyType = namedOrBlankNode;
