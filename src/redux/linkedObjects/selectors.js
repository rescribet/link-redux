export const linkedObjectByIRI = (state, iri) =>
  state.getIn(['linkedObjects', 'items'])[iri];

export const linkedObjectVersionByIRI = (state, iri) =>
  state.getIn(['linkedObjects', 'versions'])[iri];

export default linkedObjectByIRI;
