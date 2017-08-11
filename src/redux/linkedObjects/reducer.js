import {
  LINKED_MODEL_TOUCH,
} from './actions';

const initialState = {};

function linkReducer(state = initialState, action) {
  switch (action.type) {
    case LINKED_MODEL_TOUCH:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}

export default linkReducer;
