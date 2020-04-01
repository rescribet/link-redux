import { BlankNode, Literal, NamedNode, Quad, SomeTerm, Term } from "@ontologies/core";
import {
  EmptyRequestStatus,
  ErrorReporter,
  FulfilledRequestStatus,
  LazyNNArgument,
  LinkedRenderStore,
  SomeNode,
} from "link-lib";
import React from "react";
import { Overwrite } from "type-zoo";

import { higherOrderWrapper } from "./register";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/****** General types ******/

export type LabelType = NamedNode | NamedNode[];

export type LinkedPropType = NamedNode | BlankNode | Literal | SomeTerm[];

export type LinkReduxLRSType<P = any> = LinkedRenderStore<React.ComponentType<P>>;

export enum ReturnType {
  Term = "term",
  Statement = "statement",
  Literal = "literal",
  Value = "value",
}

export type SubjectType = SomeNode;

export type TopologyContextType = NamedNode | undefined;

export type TopologyRenderer = (subject: SomeNode) => React.ReactNode | React.ReactNode[];

export type TopologyType = TopologyContextType | null;

export type ToJSOutputTypes = string | number | Date | boolean | object |
  string[] | number[] | Date[] | boolean[] | object[];

export interface TermOpts extends DataOpts {
  returnType: ReturnType.Term;
}
export interface StatementOpts extends DataOpts {
  returnType: ReturnType.Statement;
}
export interface LiteralOpts extends DataOpts {
  returnType: ReturnType.Literal;
}
export interface ValueOpts extends DataOpts {
  returnType: ReturnType.Value;
}

export const defaultOptions: DataOpts = {
  returnType: ReturnType.Term,
};

/****** Property registration ******/

export interface RegistrationOpts<P> {
  hocs?: Array<higherOrderWrapper<P>>;
  linkOpts?: LinkOpts;
  mapDataToProps?: MapDataToPropsParam;
  property?: LazyNNArgument;
  topology?: LazyNNArgument;
  type: LazyNNArgument;
}

export interface TypeRegistrationOpts<P> extends RegistrationOpts<P> {
  property?: undefined;
}

export interface PropertyRegistrationOpts<P> extends RegistrationOpts<P> {
  property: LazyNNArgument;
}

export type TypeFC<P = {}> = TypeRegistrationOpts<P> & React.FC<P & Partial<SubjectProp>>;

// export type PropertyFC<P extends PropertyProps = PropertyProps> = PropertyRegistrationOpts<P>
//   & React.FC<P & Partial<SubjectProp> & PropertyProps>;

export type PropertyFC<P = {}> = PropertyRegistrationOpts<P> & React.FC<P & Partial<SubjectProp> & PropertyProps>;

export type FC<P = {}> = P extends InferProperty ? PropertyFC<P> : TypeFC<P>;

export type RegistrableComponent<P = {}> = Component<P> | FC<P>;

export type Component<P = {}> = React.ComponentType<P & SubjectProp> & RegistrationOpts<P>;

/****** Types & Composite types ******/

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

export interface DataOpts {
  returnType: ReturnType;
}

export type DataHookReturnType = Quad[] | Term[] | string[] | ToJSOutputTypes[];

export interface GlobalLinkOpts {
    fetch: boolean;
    forceRender: boolean;
    limit: number;
    returnType: ReturnType;
}

export interface LinkOpts extends Partial<GlobalLinkOpts> {
    fetch?: boolean;
    forceRender?: boolean;
    label?: LabelType;
    limit?: number;
    returnType?: ReturnType;
    linkedProp?: LinkedPropType;
}

export type PropParam = NamedNode | NamedNode[] | LinkOpts;

export interface MapDataToPropsParam {
    [k: string]: PropParam;
}

/**
 * Used to determine if a component is a property component, that is to say it triggers for
 * properties or datatypes and receives the `linkedProp` prop.
 */
interface InferProperty {
  linkedProp: object;
}

export interface PropertyProps {
  linkedProp: SomeTerm;
}

export interface PropertyPropsArr {
  linkedProp: SomeTerm[];
}

/** Props passed to the error handling component (type ll:ErrorResource). */
export interface ErrorProps extends SubjectProp {
  error?: Error;
  linkRequestStatus: EmptyRequestStatus | FulfilledRequestStatus;
  report: ErrorReporter;
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
    dataSubjects?: SubjectType[];
}

export interface TopologyContextProp {
    topology: TopologyContextType;
}

export interface TopologyProp {
    topology: TopologyType;
}

export interface PassableRef<T> {
  innerRef: React.Ref<T>;
}
