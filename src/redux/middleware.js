import {
  FETCH_LINKED_OBJECT,
  GET_LINKED_OBJECT,
  linkedModelTouch,
} from './linkedObjects/actions';

const emitChangedSubjects = (statements, next) => next(linkedModelTouch(statements));

function handleFetchLinkedObject(lrstore, next, action) {
  const { href } = action.payload;

  lrstore
    .getEntity(href, true)
    .then(statements => emitChangedSubjects(statements, next));
}

function handleGetLinkedObject(lrstore, next, action) {
  const { iri } = action.payload;
  return lrstore.tryEntity(iri, next);
}

const linkMiddleware = lrstore => () => next => (action) => {
  if (!action.payload || !action.payload.linkedObjectAction) {
    return next(action);
  }

  switch (action.type) {
    case FETCH_LINKED_OBJECT:
      return handleFetchLinkedObject(lrstore, next, action);
    case GET_LINKED_OBJECT:
      return handleGetLinkedObject(lrstore, next, action);
    default:
      return next(action);
  }
};

/**
 * Link middleware creator function.
 * @param {LinkedRenderStore} lrstore A LinkedRenderStore instance.
 * @return Redux middleware function for Link-Redux.
 */
export default lrstore => linkMiddleware(lrstore);
