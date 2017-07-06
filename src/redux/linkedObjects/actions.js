// Linked Objects
export const FETCH_LINKED_OBJECT = 'FETCH_LINKED_OBJECT';
export const GET_LINKED_OBJECT = 'GET_LINKED_OBJECT';
export const LINKED_GRAPH_UPDATE = 'LINKED_GRAPH_UPDATE';

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

export default fetchLinkedObject;
