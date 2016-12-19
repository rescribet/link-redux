export const selectLinkedObjectById = (state, iri) =>
  state.getIn(['linkedObjects', 'items', iri]);

export const selectLinkedObject = (state, props) =>
  selectLinkedObjectById(state, props.object);

export default selectLinkedObject;
