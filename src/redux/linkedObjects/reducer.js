import { handleActions } from 'redux-actions';
import { Map } from 'immutable';

import { FETCH_LINKED_OBJECT } from './actions';

const initialState = new Map({
  items: new Map(),
});

export default handleActions({
  [FETCH_LINKED_OBJECT]: (state, action) => {
    const { error, payload } = action;
    if (error !== true) {
      const id = payload.record['@id'] || payload.href;
      return state.setIn(
        ['items', id],
        (state.getIn(['items', id]) || new Map())
          .mergeDeep(payload.record)
          .merge({
            href_url: payload.href,
            loading: payload.loading,
          }),
      );
    }
    return state;
  },
}, initialState);
