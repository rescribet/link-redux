import { BAD_REQUEST } from "http-status-codes";
import {
    defaultNS as NS,
    SomeNode,
} from "link-lib";
import * as ReactPropTypes from "prop-types";
import { BlankNode, NamedNode, Statement } from "rdflib";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { lrsType, subjectType, topologyType } from "../propTypes";
import { Property } from "../react/components/Property";
import {
    LinkAction,
    LinkContext,
    LinkStateTree,
    LoadLinkedObject,
    PropertyProps,
    SubjectProp,
} from "../types";

import { fetchLinkedObject, getLinkedObject } from "./linkedObjects/actions";
import { linkedObjectVersionByIRI } from "./linkedObjects/selectors";

export interface PropTypes extends PropertyProps {
    fetch?: boolean;
    forceRender?: boolean;
    loadLinkedObject: LoadLinkedObject;
    onError?: () => void;
    onLoad?: () => void;
    topology?: NamedNode;
}

const propTypes = {
    children: ReactPropTypes.node,
    fetch: ReactPropTypes.bool,
    forceRender: ReactPropTypes.bool,
    loadLinkedObject: ReactPropTypes.func.isRequired,
    onError: ReactPropTypes.oneOfType([
        ReactPropTypes.element,
        ReactPropTypes.func,
    ]),
    onLoad: ReactPropTypes.oneOfType([
        ReactPropTypes.element,
        ReactPropTypes.func,
    ]),
    subject: subjectType.isRequired,
    topology: topologyType,
    version: ReactPropTypes.string.isRequired,
};

const nodeTypes = ["NamedNode", "BlankNode"];

class LinkedResourceContainerComp
    extends React.Component<PropTypes> implements React.ChildContextProvider<LinkContext> {

    public static childContextTypes = {
        subject: subjectType,
        topology: topologyType,
    };
    public static contextTypes = {
        linkedRenderStore: lrsType,
        topology: topologyType,
    };
    public static defaultProps = {
        children: undefined,
        forceRender: false,
        onError: undefined,
        onLoad: undefined,
        topology: undefined,
    };
    public static displayName = "LinkedResourceContainer";
    public static propTypes = propTypes;

    public static hasData(data: Statement[]) {
        return typeof data !== "undefined" && data.length >= 2;
    }

    public hasErrors() {
        const status = this.context.linkedRenderStore.getResourceProperty(this.subject(), NS.http("statusCodeValue"));

        return status && Number.parseInt(status.value, 10) >= BAD_REQUEST;
    }

    public getChildContext(): LinkContext {
        return {
            subject: this.subject(),
            topology: this.topology(),
        };
    }

    public componentWillMount() {
        this.loadLinkedObject();
    }

    public componentWillReceiveProps(nextProps: PropTypes) {
        if (this.props.subject !== nextProps.subject) {
            this.loadLinkedObject(nextProps);
        }
    }

    public shouldComponentUpdate(nextProps: PropTypes) {
        return this.props.version !== nextProps.version ||
            this.props.subject !== nextProps.subject;
    }

    public render() {
        const { linkedRenderStore } = this.context;
        const data = this.data();
        if (this.props.forceRender && this.props.children) {
            return this.renderChildren();
        }
        if (!LinkedResourceContainerComp.hasData(data)) {
            const loadComp = this.onLoad();

            return loadComp === null ? null : React.createElement(loadComp, this.props);
        }
        if (this.hasErrors()) {
            const errComp = this.onError();
            if (errComp) {
                return React.createElement(
                    errComp,
                    { ...this.props, subject: this.subject() },
                );
            }

            return null;
        }
        if (this.props.children) {
            return this.renderChildren();
        }
        const component = linkedRenderStore.resourceComponent(
            this.props.subject,
            this.topology(),
        );
        if (component !== undefined) {
            return React.createElement(component, this.props);
        }

        return React.createElement(
            "div",
            { className: "no-view" },
            React.createElement(
                Property,
                { label: linkedRenderStore.namespaces.schema("name") },
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
        return this.props.topology === null
            ? undefined
            : (this.props.topology || this.context.topology);
    }

    protected renderChildren() {
        return React.createElement(
            "div",
            { className: "view-overridden", style: { display: "inherit" } },
            this.props.children,
        );
    }

    private data(props = this.props): Statement[] {
        return this.context.linkedRenderStore.tryEntity(this.subject(props));
    }

    private loadLinkedObject(props = this.props): void {
        const data = this.data(props);
        if (data.length === 0) {
            const subject = this.subject(props);
            if (subject.termType === "BlankNode") {
                throw new TypeError("Cannot load a blank node since it has no defined way to be resolved.");
            }
            this.props.loadLinkedObject(subject, props.fetch || true);
        }
    }

    private objType(): SomeNode[] {
        const { linkedRenderStore } = this.context;

        return linkedRenderStore.getResourceProperties(NS.rdf("type")) || [linkedRenderStore.defaultType];
    }

    private onError(): React.ReactType {
        return this.props.onError || this.context.linkedRenderStore.onError;
    }

    private onLoad(): React.ReactType {
        return this.props.onLoad || this.context.linkedRenderStore.loadingComp || null;
    }
}

export { LinkedResourceContainerComp };

const mapStateToProps = (state: LinkStateTree, { subject }: SubjectProp) => {
    if (!subject) {
        throw new Error("[LRC] a subject must be given");
    }
    if (!nodeTypes.includes(subject.termType)) {
        throw new Error(`[LRC] Subject must be a node (was "${typeof subject}[${subject}]")`);
    }

    return {
        version: linkedObjectVersionByIRI(state, subject) || "new",
    };
};

const mapDispatchToProps = (dispatch: Dispatch): { loadLinkedObject: LoadLinkedObject } => ({
    loadLinkedObject: (href: NamedNode, fetch: boolean): LinkAction =>
        dispatch(fetch === false ?
            getLinkedObject(href) :
            fetchLinkedObject(href)),
});

// tslint:disable-next-line variable-name
export const LinkedResourceContainer = connect(mapStateToProps, mapDispatchToProps)(LinkedResourceContainerComp);
