import { isLiteral, Node, QuadPosition, Quadruple } from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import * as rdfs from "@ontologies/rdfs";
import { LinkedRenderStore } from "link-lib";

import { NestedBoundData } from "./types";

const base = "http://www.w3.org/1999/02/22-rdf-syntax-ns#_";

function numAsc(a: Quadruple, b: Quadruple) {
  const aP = Number.parseInt(a[QuadPosition.predicate].value.slice(base.length), 10);
  const bP = Number.parseInt(b[QuadPosition.predicate].value.slice(base.length), 10);

  return aP - bP;
}

export function orderedElementsOfSeq(store: LinkedRenderStore<any>, seqIRI: Node): NestedBoundData {
  const elements = store
    .getResourcePropertyRaw(seqIRI, rdfs.member)
    .sort(numAsc);

  return [elements, [seqIRI]];
}

export function orderedElementsOfList(store: LinkedRenderStore<any>, listEntry: Node): NestedBoundData {
  const list = [];
  const nodes = [listEntry];
  let next = listEntry;
  while (next && next !== rdfx.nil) {
    const item = store.getResourcePropertyRaw(next, rdfx.first)[0];
    if (!item) {
      break;
    }

    list.push(item);
    const rest = store.getResourceProperty(next, rdfx.rest);
    if (!rest || isLiteral(rest) || nodes.includes(rest)) {
      break;
    }
    nodes.push(next);
    next = rest as Node;
  }

  return [list, nodes];
}
