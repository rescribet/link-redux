import { BlankNode, NamedNode } from "rdflib";

import { LinkStateTree, SubjectType } from "../types";

export const linkedObjectVersionByIRI = (state: LinkStateTree, iri: SubjectType): string => {
    if ("linkedObjects" in state) {
        return state.linkedObjects[iri.value];
    }
    const s = state.get("linkedObjects");

    return s ? s[iri.value] : "";
};
