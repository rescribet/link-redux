import { BlankNode, NamedNode } from "rdflib";

import { LinkStateTree, SubjectType } from "../../types";

export const linkedObjectVersionByIRI = (state: LinkStateTree, iri: SubjectType) => {
    if ("linkedObjects" in state) {
        return state.linkedObjects[iri.toString()];
    } else {
        const s = state.get("linkedObjects");

        return s && s[iri.toString()];
    }
};
