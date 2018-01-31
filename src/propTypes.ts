import { LinkedRenderStore } from "link-lib";
import * as ReactPropTypes from "prop-types";
import { BlankNode, Literal, NamedNode } from "rdflib";

export const linkType = ReactPropTypes.oneOfType([
    ReactPropTypes.instanceOf(NamedNode),
    ReactPropTypes.instanceOf(BlankNode),
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
export const subjectType = linkType;
export const topologyType = linkType;
