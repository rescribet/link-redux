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

  /** Return the `object`, keeping the underlying rdf data model. */
  AllTerms,
  /** Keep the underlying rdf data model */
  AllStatements,
  /** Return the `object` converted to the nearest matching JS type, or a plain string if not possible. */
  AllLiterals,
  /** Return the `object` as a string value. */
  AllValues,
}

export type LaxNode = SomeNode | undefined;

export type LaxProperty = NamedNode | undefined;

export type SubjectType = SomeNode;

export type TopologyContextType = NamedNode | undefined;

export type TopologyRenderer = (subject: SomeNode) => React.ReactNode | React.ReactNode[];

export type TopologyType = TopologyContextType | null;

export type ToJSOutputTypes = string | number | Date | boolean | object |
  string[] | number[] | Date[] | boolean[] | object[];

export interface DataOpts {
  returnType: ReturnType;
}

export interface TermOpts {
  returnType: ReturnType.Term;
}
export interface StatementOpts {
  returnType: ReturnType.Statement;
}
export interface LiteralOpts {
  returnType: ReturnType.Literal;
}
export interface ValueOpts {
  returnType: ReturnType.Value;
}

export interface AllTermsOpts {
  returnType: ReturnType.AllTerms;
}
export interface AllStatementsOpts {
  returnType: ReturnType.AllStatements;
}
export interface AllLiteralsOpts {
  returnType: ReturnType.AllLiterals;
}
export interface AllValuesOpts {
  returnType: ReturnType.AllValues;
}

export const defaultOptions: DataOpts = {
  returnType: ReturnType.AllTerms,
};

/** All possible return types from data mapping functions */
export type ReturnValueTypes = Quad | Quad[] | SomeTerm | SomeTerm[] | string | string[] | ToJSOutputTypes | undefined;

export type OutputTypeFromOpts<T extends Partial<DataOpts>, Default = never> =
  T extends ValueOpts ? string | undefined :
  T extends LiteralOpts ? ToJSOutputTypes | undefined :
  T extends StatementOpts ? Quad | undefined :
  T extends TermOpts ? SomeTerm | undefined :
  T extends AllValuesOpts ? string[] :
  T extends AllLiteralsOpts ? ToJSOutputTypes[] :
  T extends AllStatementsOpts ? Quad[] :
  T extends AllTermsOpts ? SomeTerm[] :
  Default;

export type OutputTypeFromReturnType<
  T extends ReturnType,
  Default = never
> = T extends ReturnType.Term ? SomeTerm | undefined :
  T extends ReturnType.Value ? string | undefined :
  T extends ReturnType.Literal ? ToJSOutputTypes | undefined :
  T extends ReturnType.Statement ? Quad | undefined :
  T extends ReturnType.AllValues ? string[] :
  T extends ReturnType.AllLiterals ? ToJSOutputTypes[] :
  T extends ReturnType.AllStatements ? Quad[] :
  T extends ReturnType.AllTerms ? SomeTerm[] :
  Default;

export type ExtractOutputType<T, Default = never> =
  T extends DataOpts ? OutputTypeFromOpts<T, Default> :
  T extends ReturnType ? OutputTypeFromReturnType<T> :
  Default;

/**
 * Maps the prop map returnType settings to corresponding values in the data object.
 *
 * When requesting more than one property, an empty array represents the empty set.
 */
export type PropertyBoundProps<T, Default extends ReturnValueTypes> = {
  [K in keyof T]: ExtractOutputType<T[K], Default>;
};

/**
 * An object with the requested properties assigned to their names, or undefined if not present.
 *
 * Also includes a non-overrideable `subject` key which corresponds to the resource the properties
 *   were taken from.
 */
export type LinkedDataObject<
  T,
  D,
  Out extends ReturnValueTypes = OutputTypeFromOpts<D>
> = PropertyBoundProps<T, Out>
  & { subject: Out extends never ? ReturnType.Term : Out };

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

export type PropertyFC<P = {}> = PropertyRegistrationOpts<P> & React.FC<P & Partial<SubjectProp> & PropertyProps>;

export type FC<P = {}> = P extends InferProperty ? PropertyFC<P> : TypeFC<P>;

export type RegistrableComponent<P = {}> = Component<P> | FC<P>;

export type Component<P = {}> = React.ComponentType<P & SubjectProp> & RegistrationOpts<P>;

export type UninheritableLinkCtxProps = LinkCtxOverrides & LinkedRenderStoreContext;

export type PropsWithOptLinkProps<P extends Partial<UninheritableLinkCtxProps>> = Overwrite<
    Omit<P, keyof UninheritableLinkCtxProps>,
    Partial<SubjectProp & TopologyProp>
>;

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

export type CalculatedChildProps<P> = P &
  LinkRenderContext &
  Partial<LinkedRenderStoreContext> &
  Partial<LinkCtxOverrides>;

export type DataHookReturnType = Quad[] | Term[] | string[] | ToJSOutputTypes[];

export interface GlobalLinkOpts extends DataOpts {
    fetch: boolean;
    forceRender: boolean;
    limit: number;
}

export interface LinkOpts extends Partial<GlobalLinkOpts>, Partial<DataOpts> {
    fetch?: boolean;
    forceRender?: boolean;
    label?: LabelType;
    limit?: number;
    returnType?: ReturnType;
    linkedProp?: LinkedPropType;
}

export interface ProcessedLinkOpts<T = string> extends LinkOpts {
  fetch: boolean;
  label: NamedNode[];
  limit: number;
  name: T;
  returnType: ReturnType;
}

export type DataToPropsMapping<P = {}> = { [T in keyof P]: ProcessedLinkOpts<T> };

export type PropMapTuple<K> = [number[], ProcessedLinkOpts<K>];

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
