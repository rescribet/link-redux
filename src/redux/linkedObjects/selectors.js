export const selectLinkedObjectById = (state, iri) =>
  state.getIn(['linkedObjects', 'items', iri]);

export const selectLinkedObject = (state, props) => {
  const obj = selectLinkedObjectById(state, props.object);
  if (obj === undefined) {
    return obj;
  }
  const same = obj.getIn(['http://www.w3.org/2002/07/owl#sameAs', '@id']);
  if (same === undefined) {
    return obj;
  }
  return selectLinkedObjectById(state, same)
    .merge(selectLinkedObjectById(state, props.object));
};

export default selectLinkedObject;
