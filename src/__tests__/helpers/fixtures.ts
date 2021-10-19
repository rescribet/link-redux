import rdfFactory, { NamedNode, Quad, Quadruple, SomeTerm } from "@ontologies/core";
import * as ld from "@ontologies/ld";
import * as rdfx from "@ontologies/rdf";
import * as schema from "@ontologies/schema";
import * as xsd from "@ontologies/xsd";
import {
  ComponentStoreTestProxy,
  createStore,
  RDFStore,
  Schema,
  SomeNode,
} from "link-lib";
import { MiddlewareActionHandler } from "link-lib/dist-types/types";
import React from "react";

import { RenderStoreProvider } from "../../components/RenderStoreProvider";
import { Resource, ResourcePropTypes } from "../../components/Resource";
import {
  LinkContext,
  LinkCtxOverrides,
  LinkReduxLRSType,
  SubjectType,
  TopologyContextType,
} from "../../index";
import ex from "../../ontology/ex";
import example from "../../ontology/example";
import http from "../../ontology/http";
import ll from "../../ontology/ll";

import { TestContext } from "./types";

interface CWOpts {
  author?: string;
  title?: string;
  text?: string;
}

interface CWResource extends CWOpts {
  id: NamedNode;
}
export type TestCtxCreator = (id?: NamedNode, attrs?: CWOpts) => TestContext<React.ComponentType<any>>;

const toDelta = (statements: Array<Quad | Quadruple>): Quadruple[] => statements
  .map<Quadruple>((st) => Array.isArray(st) ? st : [st.subject, st.predicate, st.object, st.graph]);

const typeObject = (id: NamedNode) => toDelta([
    rdfFactory.quad(id, rdfx.type, schema.CreativeWork),
]);

const sTitle = (id: NamedNode, title: string) => toDelta([
    rdfFactory.quad(id, schema.name, rdfFactory.literal(title)),
]);

const sFull = (id: NamedNode, attrs: CWOpts = {}): Quadruple[] => {
    const createQuad = (predicate: NamedNode, object: SomeTerm, graph = ld.add) => rdfFactory.quad(
        id,
        predicate,
        object,
        graph,
    );
    const comments = rdfFactory.blankNode();
    const reviews = rdfFactory.blankNode();
    const reviews1 = rdfFactory.blankNode();
    const reviews2 = rdfFactory.blankNode();
    const reviews3 = rdfFactory.blankNode();
    const reviews4 = rdfFactory.blankNode();
    const brokenList = rdfFactory.blankNode();
    const brokenList1 = rdfFactory.blankNode();
    const endlessList = rdfFactory.blankNode();
    const endlessList1 = rdfFactory.blankNode();
    const circularList = rdfFactory.blankNode();
    const circularList1 = rdfFactory.blankNode();
    const accountablePerson = rdfFactory.blankNode();
    const uci = rdfFactory.blankNode();

    return toDelta([
        typeObject(id)[0],
        createQuad(http.statusCode, rdfFactory.literal(200), ll.meta),
        createQuad(schema.name, rdfFactory.literal(attrs.title || "title")),
        createQuad(schema.text, rdfFactory.literal(attrs.text || "text", rdfx.langString)),
        createQuad(schema.author, rdfFactory.namedNode(attrs.author || "http://example.org/people/0")),
        createQuad(schema.accountablePerson, accountablePerson),
        createQuad(schema.dateCreated, rdfFactory.literal(new Date("2019-01-01"))),
        createQuad(ex.ns("timesRead"), rdfFactory.literal(5)),
        createQuad(example.ns("tags"), example.ns("tag/0")),
        createQuad(example.ns("tags"), example.ns("tag/1")),
        createQuad(example.ns("tags"), example.ns("tag/2")),
        createQuad(example.ns("tags"), example.ns("tag/3")),
        createQuad(schema.isSimilarTo, rdfFactory.literal("other")),
        createQuad(schema.comment, comments),
        createQuad(schema.reviews, reviews),
        createQuad(example.ns("broken"), brokenList),
        createQuad(example.ns("endless"), endlessList),
        createQuad(example.ns("circular"), circularList),
        rdfFactory.quad(comments, rdfx.type, rdfx.Seq, ld.add),
        rdfFactory.quad(comments, rdfx.ns("_2"), rdfFactory.literal("e2"), ld.add),
        rdfFactory.quad(comments, rdfx.ns("_1"), rdfFactory.literal("e1"), ld.add),
        rdfFactory.quad(comments, rdfx.ns("_4"), rdfFactory.literal("e4"), ld.add),
        rdfFactory.quad(comments, rdfx.ns("_3"), rdfFactory.literal("e3"), ld.add),

        rdfFactory.quad(reviews, rdfx.type, rdfx.List, ld.add),
        rdfFactory.quad(reviews, rdfx.first, rdfFactory.literal("r0"), ld.add),
        rdfFactory.quad(reviews, rdfx.rest, reviews1, ld.add),
        rdfFactory.quad(reviews1, rdfx.first, rdfFactory.literal("r1"), ld.add),
        rdfFactory.quad(reviews1, rdfx.rest, reviews2, ld.add),
        rdfFactory.quad(reviews2, rdfx.first, rdfFactory.literal("r2"), ld.add),
        rdfFactory.quad(reviews2, rdfx.rest, reviews3, ld.add),
        rdfFactory.quad(reviews3, rdfx.first, rdfFactory.literal("r3"), ld.add),
        rdfFactory.quad(reviews3, rdfx.rest, reviews4, ld.add),
        rdfFactory.quad(reviews4, rdfx.first, rdfFactory.literal("r4"), ld.add),
        rdfFactory.quad(reviews4, rdfx.rest, rdfx.nil, ld.add),

        rdfFactory.quad(brokenList, rdfx.type, rdfx.List, ld.add),
        rdfFactory.quad(brokenList, rdfx.first, rdfFactory.literal("b0"), ld.add),
        rdfFactory.quad(brokenList, rdfx.rest, brokenList1, ld.add),
        rdfFactory.quad(brokenList1, rdfx.first, rdfFactory.literal("b1"), ld.add),
        rdfFactory.quad(brokenList1, rdfx.rest, rdfFactory.literal("foobar"), ld.add),

        rdfFactory.quad(endlessList, rdfx.type, rdfx.List, ld.add),
        rdfFactory.quad(endlessList, rdfx.first, rdfFactory.literal("e0"), ld.add),
        rdfFactory.quad(endlessList, rdfx.rest, endlessList1, ld.add),
        rdfFactory.quad(endlessList1, rdfx.first, rdfFactory.literal("e1"), ld.add),

        rdfFactory.quad(circularList, rdfx.type, rdfx.List, ld.add),
        rdfFactory.quad(circularList, rdfx.first, rdfFactory.literal("c0"), ld.add),
        rdfFactory.quad(circularList, rdfx.rest, circularList1, ld.add),
        rdfFactory.quad(circularList1, rdfx.first, rdfFactory.literal("c1"), ld.add),
        rdfFactory.quad(circularList1, rdfx.rest, circularList, ld.add),

        rdfFactory.quad(accountablePerson, rdfx.type, schema.Person, ld.add),
        rdfFactory.quad(accountablePerson, schema.name, rdfFactory.literal("Roy"), ld.add),
        rdfFactory.quad(accountablePerson, schema.alumniOf, uci, ld.add),
        rdfFactory.quad(accountablePerson, schema.alumniOf, rdfFactory.literal("UCI"), ld.add),
        rdfFactory.quad(accountablePerson, schema.keywords, rdfFactory.literal("UCI"), ld.add),

        rdfFactory.quad(uci, schema.name, rdfFactory.literal("UCI"), ld.add),
    ].filter(Boolean));
};

export const globalId = rdfFactory.namedNode("https://example.com/");
export const badUrl = rdfFactory.namedNode("_://example.com/");
export const localId = rdfFactory.blankNode();
export const b64Literal = rdfFactory.literal("QQ==", xsd.base64Binary);
export const bigIntLiteral = rdfFactory.literal("36893488147419103231", xsd.positiveInteger);
export const booleanLiteral = rdfFactory.literal(true);
export const falseBooleanLiteral = rdfFactory.literal(false);
export const altBooleanLiteral = rdfFactory.literal("1", xsd.xsdboolean);
export const alt2BooleanLiteral = rdfFactory.literal("t", xsd.xsdboolean);
export const dateLiteral = rdfFactory.literal(new Date("2019-01-01"));
export const langStringLiteral = rdfFactory.literal("LangString", "en");
export const stringLiteral = rdfFactory.literal("RegularString", xsd.string);
export const integerLiteral = rdfFactory.literal(5);
export const nanIntegerLiteral = rdfFactory.literal("o", xsd.integer);
export const doubleLiteral = rdfFactory.literal(6.7);

const allTypesPropObject = (id: NamedNode, prop: NamedNode): Quadruple[] => {
  const createQuad = (predicate: NamedNode, object: SomeTerm, graph = ld.add) => rdfFactory.quad(
    id,
    predicate,
    object,
    graph,
  );

  return toDelta([
    createQuad(prop, globalId),
    createQuad(prop, badUrl),
    createQuad(prop, localId),
    createQuad(prop, b64Literal),
    createQuad(prop, bigIntLiteral),
    createQuad(prop, booleanLiteral),
    createQuad(prop, falseBooleanLiteral),
    createQuad(prop, altBooleanLiteral),
    createQuad(prop, alt2BooleanLiteral),
    createQuad(prop, dateLiteral),
    createQuad(prop, langStringLiteral),
    createQuad(prop, stringLiteral),
    createQuad(prop, integerLiteral),
    createQuad(prop, nanIntegerLiteral),
    createQuad(prop, doubleLiteral),
  ]);
};

function createComponentWrapper(lrs: LinkReduxLRSType, subject: SubjectType) {
  return (children?: React.ReactElement<any>,
          topology?: TopologyContextType,
          lrsOverride?: LinkReduxLRSType,
          resourceProps?: Partial<ResourcePropTypes<any>>): React.ReactElement<any> => {

    return React.createElement(RenderStoreProvider, { value: lrsOverride || lrs },
      React.createElement("div", { "data-testid": "root" },
        React.createElement(
          Resource,
          { forceRender: true, subject, topology, ...resourceProps },
          children,
        )));
  };
}

export function chargeLRS(delta: Quadruple[] = [], subject: SomeNode): TestContext<React.ComponentType<any>> {
    const store = new RDFStore();
    const s = new Schema(store);
    const lrsOpts = {
      mapping: new ComponentStoreTestProxy<React.ComponentType>(s),
      report: jest.fn(),
      schema: s,
      store,
    };
    const middleware = [
      (_: LinkReduxLRSType) => (next: MiddlewareActionHandler) => (action: SomeNode, args: any) => {
        switch (action) {
          case ex.ns("a"): return Promise.resolve("a");
          case ex.ns("b"): return Promise.resolve("b");
          default: return next(action, args);
        }
      },
    ];
    const lrs = createStore(lrsOpts, middleware);
    lrs.actions.test = {};
    lrs.actions.test.execB = () => lrs.exec(ex.ns("b"));
    lrs.api.processDelta(delta);
    store.processDelta(delta);
    store.flush();

    return {
        contextProps: (topology?: TopologyContextType): LinkContext & LinkCtxOverrides => ({
            lrs,
            subject,
            subjectCtx: subject,
            topology,
            topologyCtx: topology,
        }),
        lrs,
        ...lrsOpts,
        subject,
        wrapComponent: createComponentWrapper(lrs, subject),
        wrapper: ({ children }) => (
          React.createElement(
            RenderStoreProvider,
            { value: lrs },
            React.createElement(
              "div",
              { "data-testid": "root" },
              React.createElement(
                Resource,
                { forceRender: true, subject },
                children,
              ),
            ),
          )
        ),
    } as TestContext<React.ComponentType<any>>;
}

export const empty = (id = example.ns("0")) => chargeLRS([], id);

export const type = (id = example.ns("1")) => chargeLRS(typeObject(id), id);

export const name = (id = example.ns("2"), title: string) => chargeLRS(
    typeObject(id).concat(sTitle(id, title)),
    id,
);

export const fullCW = (id = example.ns("3"), attrs: CWOpts = {}) => chargeLRS(
    sFull(id, attrs),
    id,
);

export const multipleCW = (id = example.ns("3"), attrs: CWOpts & { second?: CWResource } = {}) => {
    const secondOpts = attrs.second || { id: example.ns("4") };
    const delta = [
      ...sFull(secondOpts.id, secondOpts),
      ...sFull(id, attrs),
    ];

    return chargeLRS(delta, id);
};

export const allTypesProp = (id: NamedNode, prop: NamedNode) => {
    const delta = allTypesPropObject(id, prop);

    return chargeLRS(delta, id);
};

export const multipleCWArr = (attrs: CWResource[] = []) => {
    const first = attrs.pop()!;
    const opts = chargeLRS(sFull(first.id, first), first.id);
    attrs.forEach((obj) => {
        opts.store.processDelta(sFull(obj.id, obj));
    });
    opts.store.flush();

    return opts;
};
