import { BlankNode, Literal, NamedNode, SomeTerm } from "@ontologies/core";
import { LazyNNArgument, LinkedRenderStore, SomeNode } from "link-lib";
import * as React from "react";
import { ElementType, FunctionComponent, Ref } from "react";
import { Overwrite } from "type-zoo";
import { higherOrderWrapper } from "./register";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/****** Types & Composite types ******/

export type LabelType = NamedNode | NamedNode[];

export type LinkedPropType = NamedNode | BlankNode | Literal | SomeTerm[];

export type LinkReduxLRSType = LinkedRenderStore<ElementType>;

export type LinkReturnType = "term" | "statement" | "literal" | "value";

export type MapDataToPropsParam = MapDataToPropsParamObject | NamedNode[];

export type RegistrableComponent<P = {}> = RegistrableComponentClass<P> | RegistrableStatelessComponent<P>;

export type SubjectType = SomeNode;

export type TopologyContextType = NamedNode | undefined;

export type TopologyRenderer = (subject: SomeNode) => React.ReactNode | React.ReactNode[];

export type TopologyType = TopologyContextType | null;

export type ToJSOutputTypes = string | number | Date | boolean | object |
  string[] | number[] | Date[] | boolean[] | object[];

export type UninheritableLinkCtxProps = LinkCtxOverrides & LinkedRenderStoreContext;

export type PropsWithOptLinkProps<P extends Partial<UninheritableLinkCtxProps>> = Overwrite<
    Omit<P, keyof UninheritableLinkCtxProps>,
    Partial<SubjectProp & TopologyProp>
>;

/****** Others ******/

export interface LinkRenderContext {
    subject: SubjectType;
    topology: NamedNode | undefined;
}

export interface LinkedRenderStoreContext {
    lrs: LinkReduxLRSType;
}

export type LinkContext = LinkRenderContext & LinkedRenderStoreContext;

export interface Helpers {
    reset: () => void;
}

export interface LinkCtxOverrides {
    reloadLinkedObject?: () => void;
    reset?: () => void;
    subjectCtx: SubjectType;
    topologyCtx: TopologyContextType;
}

export interface LinkOpts {
    forceRender?: boolean;
    label?: LabelType;
    limit?: number;
    linkedProp?: LinkedPropType;
    name?: string;
    returnType?: LinkReturnType;
}

export interface MapDataToPropsParamObject {
    [k: string]: NamedNode | NamedNode[] | LinkOpts;
}

export interface RegistrableComponentClass<P = {}> extends React.Component<P>, RegistrationOpts<P> {}

export interface RegistrableStatelessComponent<P = {}> extends FunctionComponent<P>, RegistrationOpts<P> {}

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

export interface DataInvalidationProps extends SubjectProp {
    dataSubjects?: SubjectType | SubjectType[];
}

export interface TopologyContextProp {
    topology: TopologyContextType;
}

export interface TopologyProp {
    topology: TopologyType;
}

export interface PassableRef<T> {
  innerRef: Ref<T>;
}
