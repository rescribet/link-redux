import { ACCEPTED, BAD_REQUEST } from "http-status-codes";
import {
    defaultNS as NS,
    EmptyRequestStatus,
    FulfilledRequestStatus,
} from "link-lib";
import { Statement } from "rdflib";
import * as React from "react";

import {
    DataInvalidationProps,
    LinkContext,
    LinkCtxOverrides,
    SubjectProp,
    TopologyContextType,
} from "../types";
import { Provider, withLinkCtx } from "./withLinkCtx";

const nodeTypes = ["NamedNode", "BlankNode"];

export interface StateTypes {
    hasCaughtError: boolean;
    caughtError?: Error;
}

export interface TypableProps extends DataInvalidationProps {
    linkVersion?: number;
    onError?: React.ReactType;
    onLoad?: React.ReactType;
}

export interface TypableInjectedProps extends SubjectProp, LinkContext, LinkCtxOverrides  {}

class Typable<P extends TypableProps & TypableInjectedProps> extends React.PureComponent<P, StateTypes> {
    public static hasErrors(status: EmptyRequestStatus | FulfilledRequestStatus) {
        if (!status.requested) {
            return false;
        }

        return status.status >= BAD_REQUEST;
    }

    public static isLoading(status: EmptyRequestStatus | FulfilledRequestStatus) {
        return status.status === ACCEPTED;
    }

    public constructor(props: P) {
        super(props);

        this.state = {
            hasCaughtError: false,
        };
    }

    public componentDidCatch(e: Error) {
        this.setState({
            caughtError: e,
            hasCaughtError: true,
        });
    }

    protected data(props: P = this.props): Statement[] {
        return this.props.lrs.tryEntity(this.subject(props));
    }

    protected renderLoadingOrError() {
        const status = this.props.lrs.getStatus(this.subject());
        if (!this.state.hasCaughtError && (Typable.isLoading(status) || this.willLoadObject())) {
            const loadComp = this.onLoad();

            return loadComp === null ? null : this.wrapContext(React.createElement(loadComp, this.props));
        }
        if (this.state.hasCaughtError || Typable.hasErrors(status)) {
            const errComp = this.onError();
            if (errComp) {
                return this.wrapContext(
                    React.createElement(
                        errComp,
                        Object.assign(
                            {},
                            this.props,
                            {
                                caughtError: this.state.caughtError,
                                linkRequestStatus: status,
                                reset: () => this.setState({
                                    caughtError: undefined,
                                    hasCaughtError: false,
                                }),
                                subject: this.subject(),
                            },
                        ),
                    ),
                );
            }

            return null;
        }

        return undefined;
    }

    protected renderNoView() {
        // tslint:disable-next-line no-console
        console.log(
            "no-view",
            this.subject(),
            this.data(),
            this.props.lrs.getStatus(this.subject()),
            this.renderLoadingOrError(),
        );

        return React.createElement(
            "div",
            { className: "no-view" },
            React.createElement("p", null, `We currently don't have a view for this (${this.props.subject})`),
        );
    }

    protected subject(props: P = this.props) {
        if (!nodeTypes.includes(props.subject.termType)) {
            throw new Error(`[LRC] Subject must be a node (was "${typeof props.subject}[${props.subject}]")`);
        }

        return props.subject;
    }

    protected topology(): TopologyContextType {
        return this.props.topology || this.props.topologyCtx;
    }

    protected onError(): React.ReactType | null {
        return (this.props.onError as any)
            || this.props.lrs.getComponentForType(
                NS.ll("ErrorResource"),
                this.topology(),
            )
            || null;
    }

    protected onLoad(): React.ReactType | null {
        return (this.props.onLoad as any)
            || this.props.lrs.getComponentForType(
                NS.ll("LoadingResource"),
                this.topology(),
            )
            || null;
    }

    protected willLoadObject(props: P = this.props): boolean {
        const s = this.subject(props);

        return (this.props.lrs as any).store.changeTimestamps[s.sI] === undefined
            && s.termType !== "BlankNode";
    }

    protected wrapContext<ChildProps>(comp: React.ReactElement<ChildProps>) {
        return React.createElement(
            Provider,
            {
                value: {
                    lrs: this.props.lrs,
                    subject: this.subject(),
                    topology: this.topology(),
                },
            },
            comp,
        );
    }
}

const connectedTypable = withLinkCtx(Typable, { topology: true });

export {
    connectedTypable as Typable,
    Typable as TypableBase,
};
