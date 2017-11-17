import {
  FETCH_LINKED_OBJECT,
  GET_LINKED_OBJECT,
  linkedModelTouch,
} from './linkedObjects/actions';

const emitChangedSubjects = next => statements => next(linkedModelTouch(statements));

const linkMiddleware = lrstore => () => (next) => {
  lrstore.subscribe(emitChangedSubjects(next), { onlySubjects: true });

  return (action) => {
    if (!action.payload || !action.payload.linkedObjectAction) {
      return next(action);
    }

    switch (action.type) {
      case FETCH_LINKED_OBJECT:
        return lrstore.getEntity(action.payload.href);
      case GET_LINKED_OBJECT:
        return lrstore.tryEntity(action.payload.iri);
      default:
        return next(action);
    }
  };
};

/**
 * Link middleware creator function.
 * @param {LinkedRenderStore} lrstore A LinkedRenderStore instance.
 * @return Redux middleware function for Link-Redux.
 */
export default lrstore => linkMiddleware(lrstore);
