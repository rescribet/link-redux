import { batchActions } from 'redux-batched-actions';
import { getValueOrID } from 'link-lib';

import {
  FETCH_LINKED_OBJECT,
  GET_LINKED_OBJECT,
} from './linkedObjects/actions';


const getLinkedObjectAction = (record, href) => ({
  type: FETCH_LINKED_OBJECT,
  payload: {
    href: href || record.href,
    record,
  },
});

const emitJSONLDResult = (ld, next) => {
  const actions = JSON.parse(ld).map(item => getLinkedObjectAction(item, item['@id']));
  return next(batchActions(actions));
};

function handleFetchLinkedObject(lrstore, next, action) {
  const { href: _href } = action.payload;
  const href = getValueOrID(_href);

  next(getLinkedObjectAction({}, href));

  return lrstore
    .getEntity(href, (json) => {
      emitJSONLDResult(json, next);
    });
  // .catch(error => next({
  //   type: FETCH_LINKED_OBJECT,
  //   error: true,
  //   payload: {
  //     message: error.message || 'Something bad happened',
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
