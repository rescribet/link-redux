import { ComponentClass, StatelessComponent } from "react";

import { LinkedRenderStore, SomeNode } from "link-lib";
import { Action, Dispatch, Middleware } from "redux";

import {
    LinkFetchAction,
    LinkGetAction,
    LinkReduxLRSType,
    LinkReloadAction,
} from "../types";
import {
    FETCH_LINKED_OBJECT,
    GET_LINKED_OBJECT,
    linkedModelTouch,
    RELOAD_LINKED_OBJECT,
} from "./linkedObjects/actions";

const emitChangedSubjects = (next: Dispatch<Action>) => (statements: SomeNode[]) => {
    const action = linkedModelTouch(statements);
    next(action);
};

const linkMiddlewareChain = (lrstore: LinkReduxLRSType) => () =>
    (next: Dispatch<Action>) => {
        lrstore.subscribe({
            callback: emitChangedSubjects(next),
            onlySubjects: true,
        });

        return (action: Action | LinkFetchAction | LinkGetAction) => {
            switch (action.type) {
                case FETCH_LINKED_OBJECT:
                    return lrstore.getEntity((action as LinkFetchAction).payload.href);
                case GET_LINKED_OBJECT:
                    return lrstore.tryEntity((action as LinkGetAction).payload.iri);
                case RELOAD_LINKED_OBJECT:
                    return lrstore.getEntity(
                        (action as LinkReloadAction).payload.href,
                        { reload: true },
                    );
                default:
                    return next(action as Action);
            }
        };
    };

/**
 * Link middleware creator function.
 * @param lrstore A LinkedRenderStore instance.
 * @return Redux middleware function for Link-Redux.
 */
export const linkMiddleware = (lrstore: LinkReduxLRSType): Middleware => linkMiddlewareChain(lrstore) as Middleware;
