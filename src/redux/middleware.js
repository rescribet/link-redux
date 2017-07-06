import { getValueOrID } from 'link-lib';

import {
  FETCH_LINKED_OBJECT,
  GET_LINKED_OBJECT,
  LINKED_GRAPH_UPDATE,
} from './linkedObjects/actions';


const getLinkedObjectAction = (record, href) => ({
  type: FETCH_LINKED_OBJECT,
  payload: {
    href: href || record.href,
    record,
  },
});

const emitJSONLDResult = (ld, next) => {
  if (typeof ld === 'object') {
    return next({
      type: LINKED_GRAPH_UPDATE,
      payload: ld,
    });
  }
  throw new Error('Unknown object passed');
};

function handleFetchLinkedObject(lrstore, next, action) {
  const { href: _href } = action.payload;
  const href = lrstore.expandProperty(getValueOrID(_href));

  next(getLinkedObjectAction({}, href));

  return lrstore
    .getEntity(href)
    .then(statements => emitJSONLDResult(statements, next));
    // .then((json) => {
    //   console.log(lrstore, json);
    //   debugger;
    // });
  // .catch(error => next({
  //   type: FETCH_LINKED_OBJECT,
  //   error: true,
  //   payload: {
  //     message: error.message || 'Something bad happened',
  //     href,
  //     href,
  //   },
  // }));
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
