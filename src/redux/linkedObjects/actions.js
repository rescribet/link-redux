// Linked Objects
export const FETCH_LINKED_OBJECT = 'FETCH_LINKED_OBJECT';
export const GET_LINKED_OBJECT = 'GET_LINKED_OBJECT';
export const LINKED_GRAPH_UPDATE = 'LINKED_GRAPH_UPDATE';
export const LINKED_MODEL_TOUCH = 'LINKED_MODEL_TOUCH';

export const fetchLinkedObject = href => ({
  type: FETCH_LINKED_OBJECT,
  payload: {
    linkedObjectAction: true,
    href,
  },
});

export const getLinkedObject = iri => ({
  type: GET_LINKED_OBJECT,
  payload: {
    linkedObjectAction: true,
    iri,
  },
});

export const linkedModelTouch = (statements) => {
  const m = {};
  statements.forEach((subject) => {
    m[subject] = Math.random().toString(36).substr(2, 5);
  });
  return {
    type: LINKED_MODEL_TOUCH,
    payload: Object.freeze(m),
  };
};

export default fetchLinkedObject;
