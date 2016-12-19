import { batchActions } from 'redux-batched-actions';
import { getValueOrID, LinkedDataAPI } from 'link-lib';

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

function handleFetchLinkedObject(next, action) {
  const { href: _href } = action.payload;
  const href = getValueOrID(_href);

  next(getLinkedObjectAction({}, href));

  return LinkedDataAPI
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

function handleGetLinkedObject(next, action) {
  const { iri } = action.payload;
  return LinkedDataAPI.getObject(iri, next);
}

const linkMiddleware = () => next => (action) => {
  if (!action.payload || !action.payload.linkedObjectAction) {
    return next(action);
  }

  switch (action.type) {
    case FETCH_LINKED_OBJECT:
      return handleFetchLinkedObject(next, action);
    case GET_LINKED_OBJECT:
      return handleGetLinkedObject(next, action);
    default:
      return next(action);
  }
};

export default linkMiddleware;
