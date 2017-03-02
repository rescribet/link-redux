export const selectLinkedObjectById = (state, iri) =>
  state.getIn(['linkedObjects', 'items', iri]);

export const selectLinkedObject = (state, props) => {
  let mergedObj = selectLinkedObjectById(state, props.object);
  if (mergedObj === undefined) {
    return mergedObj;
  }
  let sameObj = mergedObj;
  do {
    const sameId = sameObj.getIn(['http://www.w3.org/2002/07/owl#sameAs', '@id']);
    sameObj = sameId ? selectLinkedObjectById(state, sameId) : undefined;
    if (sameObj) {
      mergedObj = sameObj.merge(mergedObj);
    }
  } while (sameObj);
  return mergedObj;
};

export default selectLinkedObject;
