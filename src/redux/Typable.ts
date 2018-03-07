import { BAD_REQUEST } from "http-status-codes";
import {
    DEFAULT_TOPOLOGY,
    defaultNS as NS,
    EmptyRequestStatus,
    FulfilledRequestStatus,
} from "link-lib";
import { Requireable } from "prop-types";
import { NamedNode, Statement } from "rdflib";
import * as React from "react";

import { lrsType, topologyType } from "../propTypes";
import { Property } from "../react/components";
import { PropertyProps } from "../types";

const nodeTypes = ["NamedNode", "BlankNode"];

export interface TypableProps extends PropertyProps {
    onError?: () => void;
    onLoad?: () => void;
}

export class Typable<P extends TypableProps, S> extends React.Component<P, S> {
    public static contextTypes = {
        linkedRenderStore: lrsType,
        topology: topologyType,
    };

    public static hasErrors(status: EmptyRequestStatus | FulfilledRequestStatus) {
        if (!status.requested) {
            return false;
        }

        return status.status >= BAD_REQUEST;
    }

    public static hasData(data: Statement[]) {
        return typeof data !== "undefined" && data.length >= 2;
    }

    protected data(props = this.props): Statement[] {
        return this.context.linkedRenderStore.tryEntity(this.subject(props));
    }

    protected renderLoadingOrError(data: Statement[]) {
        if (!Typable.hasData(data)) {
            const loadComp = this.onLoad();

            return loadComp === null ? null : React.createElement(loadComp, this.props);
        }
        const status = this.context.linkedRenderStore.api.getStatus(this.subject());
        if (Typable.hasErrors(status)) {
            const errComp = this.onError();
            if (errComp) {
                return React.createElement(
                    errComp,
                    Object.assign(
                        {},
                        this.props,
                        {
                            linkRequestStatus: status,
                            subject: this.subject(),
                        },
                    ),
                );
            }

            return null;
        }

        return undefined;
    }

    protected renderNoView() {
        return React.createElement(
            "div",
            { className: "no-view" },
            React.createElement(
                Property,
                { label: this.context.linkedRenderStore.namespaces.schema("name") },
            ),
            React.createElement("p", null, `We currently don"t have a view for this (${this.props.subject})`),
        );
    }

    protected subject(props = this.props) {
        if (!nodeTypes.includes(props.subject.termType)) {
            throw new Error(`[LRC] Subject must be a node (was "${typeof props.subject}[${props.subject}]")`);
        }

        return props.subject;
    }

    protected topology(): NamedNode | undefined {
        return this.context.topology;
    }

    protected onError(): React.ReactType {
        return this.props.onError
            || this.context.linkedRenderStore.getComponentForType(
                NS.ll("ErrorResource"),
                this.topology() || DEFAULT_TOPOLOGY,
            )
            || this.context.linkedRenderStore.onError
            || null;
    }

    protected onLoad(): React.ReactType {
        return this.props.onLoad
            || this.context.linkedRenderStore.getComponentForType(
                NS.ll("LoadingResource"),
                this.topology() || DEFAULT_TOPOLOGY,
            )
            || this.context.linkedRenderStore.loadingComp
            || null;
    }
}
