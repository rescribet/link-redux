import rdfFactory, { NamedNode, Quad } from "@ontologies/core";
import {
    ComponentStoreTestProxy,
    defaultNS as NS,
    LinkedRenderStore,
    RDFStore,
    Schema,
    SomeNode,
} from "link-lib";
import { createElement, ReactElement, ReactType } from "react";

import { LinkedResourceContainer } from "../src/components/LinkedResourceContainer";
import { RenderStoreProvider } from "../src/components/RenderStoreProvider";
import {
    LinkContext,
    LinkCtxOverrides,
    TopologyContextType,
} from "../src/link-redux";

import { TestContext } from "./types";

const exNS = NS.example;

interface CWOpts {
  author?: string;
  title?: string;
  text?: string;
}

interface CWResource extends CWOpts {
  id: NamedNode;
}

const typeObject = (id: NamedNode) => [
    rdfFactory.quad(id, NS.rdf("type"), NS.schema("CreativeWork")),
];

const sTitle = (id: NamedNode, title: string) => [
    rdfFactory.quad(id, NS.schema("name"), rdfFactory.literal(title)),
];

const sFull = (id: NamedNode, attrs: CWOpts = {}) => {
    return [
        typeObject(id)[0],
        rdfFactory.quad(
          id,
          NS.schema("name"),
          rdfFactory.literal(attrs.title || "title"),
          NS.example("default"),
        ),
        rdfFactory.quad(
          id,
          NS.schema("text"),
          rdfFactory.literal(attrs.text || "text"),
          NS.example("default"),
        ),
        rdfFactory.quad(
          id,
          NS.schema("author"),
          rdfFactory.namedNode(attrs.author || "http://example.org/people/0"),
          NS.example("default"),
        ),
        rdfFactory.quad(
          id,
          NS.schema("dateCreated"),
          rdfFactory.literal(new Date("2019-01-01")),
          NS.example("default"),
        ),
        rdfFactory.quad(id, NS.ex("timesRead"), rdfFactory.literal(5), NS.example("default")),
        rdfFactory.quad(id, NS.example("tags"), NS.example("tag/0"), NS.example("default")),
        rdfFactory.quad(id, NS.example("tags"), NS.example("tag/1"), NS.example("default")),
        rdfFactory.quad(id, NS.example("tags"), NS.example("tag/2"), NS.example("default")),
        rdfFactory.quad(id, NS.example("tags"), NS.example("tag/3"), NS.example("default")),
    ];
};

export function chargeLRS(statements: Quad[] = [], subject: SomeNode): TestContext<ReactType> {
    const store = new RDFStore();
    const schema = new Schema(store);
    const mapping = new ComponentStoreTestProxy<ReactType>(schema);
    const lrs = new LinkedRenderStore<ReactType>({ mapping, schema, store });
    store.addStatements(statements);
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
        mapping,
        schema,
        store,
        subject,
        wrapComponent: (children?: ReactElement<any>,
                        topology?: TopologyContextType,
                        lrsOverride?: unknown): ReactElement<any> => {

            return createElement(RenderStoreProvider, { value: lrsOverride || lrs },
                createElement("div", { className: "root" },
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

export const fullCW = (id = exNS("3"), attrs: CWOpts = {}) => chargeLRS(
    sFull(id, attrs),
    id,
);

export const multipleCW = (id = exNS("3"), attrs: CWOpts & { second?: CWResource } = {}) => {
    const opts = chargeLRS(sFull(id, attrs), id);
    const second = attrs.second || { id: exNS("4") };
    opts.store.addStatements(sFull(exNS(second.id.value), second));
    opts.store.flush();

    return opts;
};

export const multipleCWArr = (attrs: CWResource[] = []) => {
    const first = attrs.pop()!;
    const opts = chargeLRS(sFull(first.id, first), first.id);
    attrs.forEach((obj) => {
        opts.store.addStatements(sFull(obj.id, obj));
    });
    opts.store.flush();

    return opts;
};
