import rdfFactory, { Feature, Quad, Term } from "@ontologies/core";

export const equals = rdfFactory.supports[Feature.identity]
  ? (a: any, b: any): boolean => a?.id === b?.id
  : (a: any, b: any): boolean => rdfFactory.equals(a, b);

export const id = rdfFactory.supports[Feature.identity]
  ? (obj?: Term | Quad | any): number => (obj as any)?.id || -1
  : (obj?: Term | Quad | any): number => rdfFactory.id(obj);
