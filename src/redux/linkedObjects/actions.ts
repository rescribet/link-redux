import { SomeNode } from "link-lib";
import { BlankNode, NamedNode } from "rdflib";
import { Action } from "redux";
import {
    LinkFetchAction,
    LinkGetAction,
    LinkModelTouchAction,
    LinkReloadAction,
    LinkStateTreeSlice,
} from "../../types";

export const FETCH_LINKED_OBJECT = "FETCH_LINKED_OBJECT";
export const GET_LINKED_OBJECT = "GET_LINKED_OBJECT";
export const LINKED_MODEL_TOUCH = "LINKED_MODEL_TOUCH";
export const RELOAD_LINKED_OBJECT = "RELOAD_LINKED_OBJECT";

export const fetchLinkedObject = (href: NamedNode): LinkFetchAction => ({
    payload: {
        href,
        linkedObjectAction: true,
    },
    type: FETCH_LINKED_OBJECT,
});

export const getLinkedObject = (iri: NamedNode): LinkGetAction => ({
    payload: {
        iri,
        linkedObjectAction: true,
    },
    type: GET_LINKED_OBJECT,
});

export const linkedModelTouch = (subjects: SomeNode[]): LinkModelTouchAction => {
    const nextVal = Math.random().toString(36).substr(2, 5);

    return {
        payload: Object.freeze(subjects.reduce((a, b) => {
            a[b.toString()] = nextVal;

            return a;
        }, {} as LinkStateTreeSlice)),
        type: LINKED_MODEL_TOUCH,
    } as LinkModelTouchAction;
};

export const reloadLinkedObject = (href: NamedNode): LinkReloadAction => ({
    payload: {
        href,
        linkedObjectAction: true,
    },
    type: RELOAD_LINKED_OBJECT,
});

export default fetchLinkedObject;
