import { LazyNNArgument, LinkedRenderStore, SomeNode } from "link-lib";
import { BlankNode, Literal, NamedNode } from "rdflib";
import * as React from "react";
import { ComponentClass, ComponentType, ReactType, StatelessComponent } from "react";
import { Action } from "redux";
import { Overwrite } from "type-zoo";
import { higherOrderWrapper } from "./register";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/****** Types & Composite types ******/

export type LabelType = NamedNode | NamedNode[];

export type LinkAction = LinkFetchAction | LinkGetAction | LinkReloadAction;

export type LoadLinkedObject = (href: NamedNode, fetch: boolean) => LinkAction;

export type LinkedPropType = NamedNode | BlankNode | Literal;

export type LinkReduxLRSType = LinkedRenderStore<ReactType>;

export type LinkReturnType = "term" | "statement" | "literal" | "value";

export type LinkStateTree = LinkStateTreeObj | LinkStateTreeMap;

export type LinkStateTreeMap = Map<string, { [k: string]: string }>;

export type MapDataToPropsParam = MapDataToPropsParamObject | NamedNode[];

export type RegistrableComponent<P = {}> = RegistrableComponentClass<P> | RegistrableStatelessComponent<P>;

export type ReloadLinkedObject = (href: NamedNode, fetch: boolean) => LinkAction;

export type SubjectType = SomeNode;

export type TopologyContextType = NamedNode | undefined;

export type TopologyRenderer = (subject: SomeNode) => React.ReactNode | React.ReactNode[];

export type TopologyType = TopologyContextType | null;

export type UninheritableLinkCtxProps = LinkCtxOverrides & LinkedRenderStoreContext;

export type PropsWithOptLinkProps<P extends Partial<UninheritableLinkCtxProps>> = Overwrite<
    Omit<P, keyof UninheritableLinkCtxProps>,
    Partial<SubjectProp & TopologyProp>
>;

/****** Others ******/

export interface LinkContext {
    subject: SubjectType;
    topology: TopologyContextType;
    lrs: LinkReduxLRSType;
}

export interface LinkedRenderStoreContext {
    lrs: LinkReduxLRSType;
}

export interface LinkCtxOverrides {
    subjectCtx: SubjectType;
    topologyCtx: TopologyContextType;
}

export interface LinkFetchPayload {
    href: NamedNode;
    linkedObjectAction: true;
}

export interface LinkFetchAction extends Action<"FETCH_LINKED_OBJECT"> {
    payload: LinkFetchPayload;
}

export interface LinkGetPayload {
    iri: NamedNode;
    linkedObjectAction: true;
}

export interface LinkGetAction extends Action<"GET_LINKED_OBJECT"> {
    payload: LinkGetPayload;
}

export interface LinkModelTouchAction extends Action<"LINKED_MODEL_TOUCH"> {
    payload: LinkStateTreeSlice;
}

export interface LinkOpts {
    forceRender?: boolean;
    label?: LabelType;
    limit?: number;
    linkedProp?: LinkedPropType;
    name?: string;
    returnType?: LinkReturnType;
}

export interface LinkReloadAction extends Action<"RELOAD_LINKED_OBJECT"> {
    payload: LinkFetchPayload;
}

export interface LinkStateTreeSlice {
    [k: string]: string;
}

export interface LinkStateTreeObj {
    linkedObjects: LinkStateTreeSlice;
}

export interface MapDataToPropsParamObject {
    [k: string]: NamedNode | NamedNode[] | LinkOpts;
}

export interface RegistrableComponentClass<P = {}> extends ComponentClass<P>, RegistrationOpts<P> {}

export interface RegistrableStatelessComponent<P = {}> extends StatelessComponent<P>, RegistrationOpts<P> {}

export interface RegistrationOpts<P> {
    hocs?: Array<higherOrderWrapper<P>>;
    linkOpts?: LinkOpts;
    mapDataToProps?: MapDataToPropsParam;
    property?: LazyNNArgument;
    topology?: LazyNNArgument | Array<NamedNode | undefined>;
    type: LazyNNArgument;
}

export interface URLConverter {
    convert: (iri: string) => string;
    match: string | RegExp;
}

export interface URLConverterSet {
    [k: string]: URLConverter;
}

export interface SubjectProp {
    subject: SubjectType;
}

export interface TopologyContextProp {
    topology: TopologyContextType;
}

export interface TopologyProp {
    topology: TopologyType;
}
