import { Action } from "redux-actions";

import { LinkAction, LinkModelTouchAction, LinkStateTreeSlice } from "../types";

import { LINKED_MODEL_TOUCH } from "./actions";

const initialState: LinkStateTreeSlice = {};

export function linkReducer(state = initialState, action: Action<any> | LinkAction | LinkModelTouchAction) {
    switch (action.type) {
        case LINKED_MODEL_TOUCH:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}
