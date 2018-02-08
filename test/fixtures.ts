import {
    ComponentStoreTestProxy,
    defaultNS as NS,
    LinkedRenderStore,
    RDFStore,
    Schema,
    SomeNode,
} from "link-lib";
import {
    Literal,
    NamedNode,
    Statement,
} from "rdflib";
import { createElement, ReactElement, ReactType } from "react";
import { Provider } from "react-redux";
import { applyMiddleware, createStore, Store } from "redux";
import { combineReducers } from "redux-immutable";
import { linkMiddleware, linkReducer } from "../src/link-redux";

import { RenderStoreProvider } from "../src/react/components";
import { LinkedResourceContainer } from "../src/redux/LinkedResourceContainer";
import { LinkReduxLRSType } from "../src/types";

import { TestContext } from "./types";

const exNS = NS.example;

const typeObject = (id: NamedNode) => [
    new Statement(id, NS.rdf("type"), NS.schema("CreativeWork")),
];

const sTitle = (id: NamedNode, title: string) => [
    new Statement(id, NS.schema("name"), new Literal(title)),
];

const sFull = (id: NamedNode, attrs: { [k: string]: string }) => {
    return [
        typeObject(id)[0],
        new Statement(id, NS.schema("name"), new Literal(attrs.title || "title"), NS.example("default")),
        new Statement(id, NS.schema("text"), new Literal(attrs.text || "text"), NS.example("default")),
        new Statement(id, NS.schema("author"), new NamedNode(attrs.author || "http://example.org/people/0"), NS.example("default")),
        new Statement(id, NS.example("tags"), NS.example("tag/0"), NS.example("default")),
        new Statement(id, NS.example("tags"), NS.example("tag/1"), NS.example("default")),
        new Statement(id, NS.example("tags"), NS.example("tag/2"), NS.example("default")),
        new Statement(id, NS.example("tags"), NS.example("tag/3"), NS.example("default")),
    ];
};

const generateReduxStore = (lrs: LinkReduxLRSType): Store => createStore(
    combineReducers({ linkedObjects: linkReducer }),
    applyMiddleware(linkMiddleware(lrs)),
);

export function chargeLRS(statements: Statement[] = [], subject: SomeNode): TestContext<ReactType> {
    const store = new RDFStore();
    const schema = new Schema(store);
    const mapping = new ComponentStoreTestProxy<ReactType>(schema);
    const lrs = new LinkedRenderStore<ReactType>({ mapping, schema, store });
    store.addStatements(statements);
    const reduxStore = generateReduxStore(lrs);

    return {
        lrs,
        mapping,
        reduxStore,
        schema,
        store,
        wrapComponent: (children?: ReactElement<any>, topology?: NamedNode | undefined): ReactElement<any> => {
            return createElement(Provider, { store: reduxStore },
                createElement(RenderStoreProvider, { linkedRenderStore: lrs },
                    createElement(
                        LinkedResourceContainer,
                        { forceRender: true, subject, topology },
                        children,
                    )));
        },
    } as TestContext<ReactType>;
}

export const empty = (id = exNS("0")) => chargeLRS([], id);

export const type = (id = exNS("1")) => chargeLRS(typeObject(id), id);

export const name = (id = exNS("2"), title: string) => chargeLRS(
    typeObject(id).concat(sTitle(id, title)),
    id,
);

export const fullCW = (id = exNS("3"), attrs = {}) => chargeLRS(
    sFull(id, attrs),
    id,
);

export const multipleCW = (id = exNS("3"), attrs: { [k: string]: string } = {}) => {
    const opts = chargeLRS(sFull(id, attrs), id);
    const second = attrs.second || { id: "4" };
    opts.store.addStatements(sFull(exNS(second.id), second));

    return opts;
};
