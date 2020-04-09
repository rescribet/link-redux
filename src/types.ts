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

/** Data types to which the data can be converted before inserting into a data map */
export enum ReturnType {
  /** Return the `object`, keeping the underlying rdf data model. */
  Term,
  /** Keep the underlying rdf data model */
  Statement,
  /** Return the `object` converted to the nearest matching JS type, or a plain string if not possible. */
  Literal,
  /** Return the `object` as a string value. */
  Value,
}

// Prevent type widening of enum.

export type ReturnLiteralType = ReturnType.Literal;
export type ReturnTermType = ReturnType.Term;
export type ReturnStatementType = ReturnType.Statement;
export type ReturnValueType = ReturnType.Value;

export type ReturnTypes = ReturnLiteralType |
  ReturnTermType |
  ReturnStatementType |
  ReturnValueType;

export type LaxNode = SomeNode | undefined;

export type LaxProperty = NamedNode | undefined;

export type SubjectType = SomeNode;

export type TopologyContextType = NamedNode | undefined;

export type TopologyRenderer = (subject: SomeNode) => React.ReactNode | React.ReactNode[];

export type TopologyType = TopologyContextType | null;

export type ToJSOutputTypes = string | number | Date | boolean | object |
  string[] | number[] | Date[] | boolean[] | object[];

export interface DataOpts {
  returnType: ReturnTypes;
}

export type DataOptsV = TermOpts |
  StatementOpts |
  LiteralOpts |
  ValueOpts;

export interface TermOpts {
  returnType: ReturnTermType;
}
export interface StatementOpts {
  returnType: ReturnStatementType;
}
export interface LiteralOpts {
  returnType: ReturnLiteralType;
}
export interface ValueOpts {
  returnType: ReturnValueType;
}

export const defaultOptions: DataOpts = {
  returnType: ReturnType.Term,
};

/** All possible return types from data mapping functions */
export type ReturnValueTypes = Quad | Quad[] | SomeTerm | SomeTerm[] | string | string[] | ToJSOutputTypes | undefined;

export type OutputTypeFromOpts<T extends Readonly<DataOptsV | {}>> =
  T extends ValueOpts ? string :
  T extends LiteralOpts ? ToJSOutputTypes :
  T extends StatementOpts ? Quad :
  T extends TermOpts ? SomeTerm :
  never;

export type OutputTypeFromReturnType<T, Default = never> =
  T extends ReturnType.Value ? string :
  T extends ReturnType.Literal ? ToJSOutputTypes :
  T extends ReturnType.Statement ? Quad :
  T extends ReturnType.Term ? SomeTerm :
  Default;

export type ExtractOutputType<T, Default = never> =
  T extends NamedNode | BlankNode | Literal ? Default :
  T extends ReturnType ? OutputTypeFromReturnType<T, Default> :
  OutputTypeFromOpts<T> extends never ? Default : OutputTypeFromOpts<T>;

/**
 * Maps the prop map returnType settings to corresponding values in the data object.
 */
export type PropertyBoundProps<T, Default extends ReturnValueTypes> = {
  [K in keyof T]: undefined | ExtractOutputType<T[K], Default>;
};

/**
 * An object with the requested properties assigned to their names, or undefined if not present.
 * Also includes a non-overrideable `subject` key which corresponds to the resource the properties were taken from.
 */
export type LinkedDataObject<T, D> = PropertyBoundProps<T, OutputTypeFromOpts<D> | undefined>
  & { subject: OutputTypeFromOpts<D> extends never ? ReturnType.Term : OutputTypeFromOpts<D> };

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

export type DataHookReturnType = Quad[] | Term[] | string[] | ToJSOutputTypes[];

export interface GlobalLinkOpts extends DataOpts {
    fetch: boolean;
    forceRender: boolean;
    limit: number;
}

export enum FetchOpts {
  /** Only fetch when stale */
  stale,
  fetch,
  hold,
  force,
}

// tslint:disable:no-bitwise
export enum Dereference {
  /** Only use data present in-memory */
  MemoryOnly = 0,

  /** Show loading indicators while fetching, but use back-ups when fails */
  NetworkFirst = 1 << 0,
  /** Show loading indicators while fetching, but use back-ups when fails */
  NetworkOnly = 1 << 1,
  /** Use data from memory while fetching in background */
  MemoryFirst = 1 << 2,

  /** Don't use proxies for dereferencing. */
  NoProxy = 1 << 3,
  /** Prefer proxy for dereferencing. */
  PreferProxy = 1 << 4,
  /** Only use proxies for dereferencing. */
  ProxyOnly = 1 << 5,

  /** Don't cross the current origin when dereferencing. */
  NoOrigin = 1 << 6,
  /** Prefer origin when dereferencing. */
  PreferOrigin = 1 << 7,
  /** Only use origin for dereferencing. */
  OriginOnly = 1 << 8,

  /** Disable use of cached resources */
  NoCache = 1 << 9,

  Default = Dereference.NetworkFirst + Dereference.NoCache,
}
// tslint:enable:no-bitwise

export interface LinkOpts extends Partial<GlobalLinkOpts>, Partial<DataOpts> {
    fetch?: boolean;
    forceRender?: boolean;
    label?: LabelType;
    limit?: number;
    returnType?: ReturnTypes;
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
