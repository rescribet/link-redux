import { Map } from 'immutable';

import { FETCH_LINKED_OBJECT } from './actions';

const initialState = new Map({
  items: new Map(),
});

function linkReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_LINKED_OBJECT:
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
    default:
      return state;
  }
}

export default linkReducer;
