import { namedNodeByIRI } from "link-lib";
import { BlankNode, NamedNode } from "rdflib";

import { LinkStateTree, SubjectType } from "../types";

export const linkedObjectVersionByIRI = (state: LinkStateTree, iri: SubjectType): string => {
    const irl = iri.termType === "NamedNode" && namedNodeByIRI(iri.value.split("#").shift()!);
    let tree;
    if ("linkedObjects" in state) {
        tree = state.linkedObjects;
    } else {
        tree = state.get("linkedObjects");
    }

    if (!tree || !iri) {
        return "";
    }

    if (irl && irl !== iri) {
        return tree[iri.value] + tree[irl.value];
    }

    return tree[iri.value];
};
