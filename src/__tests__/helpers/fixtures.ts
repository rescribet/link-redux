import rdfFactory, { NamedNode, Quad, SomeTerm } from "@ontologies/core";
import rdfx from "@ontologies/rdf";
import schema from "@ontologies/schema";
import {
    ComponentStoreTestProxy,
    LinkedRenderStore,
    RDFStore,
    Schema,
    SomeNode,
} from "link-lib";
import React from "react";

import { RenderStoreProvider } from "../../components/RenderStoreProvider";
import { Resource, ResourcePropTypes } from "../../components/Resource";
import {
  LinkContext,
  LinkCtxOverrides,
  LinkReduxLRSType, SubjectType,
  TopologyContextType,
} from "../../index";
import ex from "../../ontology/ex";
import example from "../../ontology/example";

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

const typeObject = (id: NamedNode) => [
    rdfFactory.quad(id, rdfx.type, schema.CreativeWork),
];

const sTitle = (id: NamedNode, title: string) => [
    rdfFactory.quad(id, schema.name, rdfFactory.literal(title)),
];

const sFull = (id: NamedNode, attrs: CWOpts = {}) => {
    const createQuad = (predicate: NamedNode, object: SomeTerm) => rdfFactory.quad(
        id,
        predicate,
        object,
        example.ns("default"),
    );

    return [
        typeObject(id)[0],
        createQuad(schema.name, rdfFactory.literal(attrs.title || "title")),
        createQuad(schema.text, rdfFactory.literal(attrs.text || "text")),
        createQuad(schema.author, rdfFactory.namedNode(attrs.author || "http://example.org/people/0")),
        createQuad(schema.dateCreated, rdfFactory.literal(new Date("2019-01-01"))),
        createQuad(ex.ns("timesRead"), rdfFactory.literal(5)),
        createQuad(example.ns("tags"), example.ns("tag/0")),
        createQuad(example.ns("tags"), example.ns("tag/1")),
        createQuad(example.ns("tags"), example.ns("tag/2")),
        createQuad(example.ns("tags"), example.ns("tag/3")),
    ];
};

function createComponentWrapper(lrs: LinkReduxLRSType, subject: SubjectType) {
  return (children?: React.ReactElement<any>,
          topology?: TopologyContextType,
          lrsOverride?: LinkReduxLRSType,
          resourceProps?: Partial<ResourcePropTypes<any>>): React.ReactElement<any> => {

    return React.createElement(RenderStoreProvider, { value: lrsOverride || lrs },
      React.createElement("div", { className: "root" },
        React.createElement(
          Resource,
          { forceRender: true, subject, topology, ...resourceProps },
          children,
        )));
  };
}

export function chargeLRS(statements: Quad[] = [], subject: SomeNode): TestContext<React.ComponentType<any>> {
    const store = new RDFStore();
    const s = new Schema(store);
    const lrsOpts = {
      mapping: new ComponentStoreTestProxy<React.ComponentType>(s),
      report: jest.fn(),
      schema: s,
      store,
    };
    const lrs = new LinkedRenderStore<React.ComponentType>(lrsOpts);
    store.addQuads(statements);
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
    const opts = chargeLRS(sFull(id, attrs), id);
    const second = attrs.second || { id: example.ns("4") };
    opts.store.addQuads(sFull(example.ns(second.id.value), second));
    opts.store.flush();

    return opts;
};

export const multipleCWArr = (attrs: CWResource[] = []) => {
    const first = attrs.pop()!;
    const opts = chargeLRS(sFull(first.id, first), first.id);
    attrs.forEach((obj) => {
        opts.store.addQuads(sFull(obj.id, obj));
    });
    opts.store.flush();

    return opts;
};
