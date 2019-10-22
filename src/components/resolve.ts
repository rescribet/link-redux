import rdfFactory, { NamedNode } from "@ontologies/core";

import { URLConverterSet } from "../types";

const converters = {
    dbpedia: {
        convert: (iri: string) => `http://dbpedia.org/data/${iri.split("//dbpedia.org/resource/").pop()}`,
        match: "^[a-zA-Z]{3,5}://dbpedia.org/resource/",
    },
} as URLConverterSet;

/**
 * Resolves an URI to a href.
 * Used when the URI does not point to the actual/parsable entity
 */
export default (iri: NamedNode): NamedNode => {
    for (const convName of Object.keys(converters)) {
        const converter = converters[convName];
        if (iri.value.match(converter.match)) {
            return rdfFactory.namedNode(converter.convert(iri.value));
        }
    }

    return iri;
};
