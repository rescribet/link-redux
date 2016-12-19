const converters = {
  dbpedia: {
    match: '^[a-zA-Z]{3,5}://dbpedia.org/resource/',
    convert: iri => `http://dbpedia.org/data/${iri.split('//dbpedia.org/resource/').pop()}`,
  },
};

/* Resolves an URI to a href.
 * Used when the URI does not point to the actual/parsable entity
 **/
export default (iri) => {
  const convKeys = Object.keys(converters);
  for (let i = 0; i < convKeys.length; i++) {
    const converter = converters[convKeys[i]];
    if (iri.match(converter.match)) {
      return converter.convert(iri);
    }
  }
  return iri;
};
