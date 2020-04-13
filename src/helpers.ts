import { BlankNode, NamedNode } from "@ontologies/core";
import { id, normalizeType, SomeNode } from "link-lib";

/** Reduces a set of resources to a number. Useful for using as a hook update dependency. */
export function reduceDataSubjects(subjects: Array<SomeNode | undefined> | SomeNode | undefined): number {
  return normalizeType(subjects)
    .filter<NamedNode | BlankNode>(Boolean as any)
    .map<number>((n: NamedNode | BlankNode) => id(n))
    .reduce((a: number, b: number) => a + b, 0);
}
