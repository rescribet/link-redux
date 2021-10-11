import rdf, { Node, Quad, SomeTerm, Term } from "@ontologies/core";
import * as rdfx from "@ontologies/rdf";
import React from "react";

import { LaxProperty, LinkReduxLRSType } from "../types";

import { useDataInvalidation } from "./useDataInvalidation";
import { useLRS } from "./useLRS";
import { useIdentifier } from "./useParsedField";

export type ResolvedField<I> = [array: I[], loading: boolean]; // TODO: done/isLoaded?

const base = "http://www.w3.org/1999/02/22-rdf-syntax-ns#_";
export const sequenceFilter = /^http:\/\/www\.w3\.org\/1999\/02\/22-rdf-syntax-ns#_[\d]+$/;

function numAsc(a: Quad, b: Quad) {
  const aP = Number.parseInt(a.predicate.value.slice(base.length), 10);
  const bP = Number.parseInt(b.predicate.value.slice(base.length), 10);

  return aP - bP;
}

function seqToArr<I extends Term>(
  lrs: LinkReduxLRSType,
  acc: I[],
  rest: Node | undefined | I[],
): I[] {
  if (Array.isArray(rest)) {
    return rest;
  }

  if (!rest || rdf.equals(rest, rdfx.nil)) {
    return acc;
  }

  lrs.tryEntity(rest)
    .filter((s) => s && s.predicate.value.match(sequenceFilter) !== null)
    .sort(numAsc)
    .map((s) => acc.push(s.object as I));

  return acc;
}

// TODO: Container (seq, alt, bag) & list

/**
 * Returns the first {property} of {resource} or the current subject which is an rdf:Seq as a JS Array.
 */
export const useArray = <I extends Term = SomeTerm>(
  property: LaxProperty,
  resource?: Node | undefined,
): ResolvedField<I> => {
  const lrs = useLRS();
  const targets = useIdentifier(property, resource);
  const lastUpdate = useDataInvalidation(targets);

  return React.useMemo(() => {
    if (!targets) {
      return [[], false];
    }

    for (let i = 0; i < targets.length; i++) {
      const result = seqToArr<I>(lrs, [], targets[i]);

      if (Array.isArray(result)) {
        return [result, false];
      }
    }

    return [[], true];
  }, [resource, property, lastUpdate, lrs]);
};
