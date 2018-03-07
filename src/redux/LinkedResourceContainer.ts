import * as ReactPropTypes from "prop-types";
import { BlankNode, NamedNode } from "rdflib";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { subjectType, topologyType } from "../propTypes";
import {
    LinkAction,
    LinkContext,
    LinkStateTree,
    LoadLinkedObject,
    PropertyProps,
    ReloadLinkedObject,
    SubjectProp,
} from "../types";

import { fetchLinkedObject, getLinkedObject, reloadLinkedObject } from "./linkedObjects/actions";
import { linkedObjectVersionByIRI } from "./linkedObjects/selectors";
import { Typable, TypableProps } from "./Typable";

export interface DispatchPropTypes {
    loadLinkedObject: LoadLinkedObject;
    reloadLinkedObject: ReloadLinkedObject;
}

export interface PropTypes extends DispatchPropTypes, TypableProps {
    fetch?: boolean;
    forceRender?: boolean;
    topology?: NamedNode;
}

export interface StateTypes {
    hasCaughtError: boolean;
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
    reloadLinkedObject: ReactPropTypes.func.isRequired,
    subject: subjectType.isRequired,
    topology: topologyType,
    version: ReactPropTypes.string.isRequired,
};

const nodeTypes = ["NamedNode", "BlankNode"];

class LinkedResourceContainerComp extends Typable<PropTypes, StateTypes>
    implements React.ChildContextProvider<LinkContext> {
    public static childContextTypes = {
        subject: subjectType,
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

    public constructor(props: PropTypes) {
        super(props);

        this.state = {
            hasCaughtError: false,
        };
    }

    public getChildContext(): LinkContext {
        return {
            subject: this.subject(),
            topology: this.topology(),
        };
    }

    public componentDidCatch() {
        this.setState({
            hasCaughtError: true,
        });
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

        const notReadyComponent = this.renderLoadingOrError(data);
        if (notReadyComponent !== undefined) {
            return notReadyComponent;
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

        return this.renderNoView();
    }

    protected renderChildren() {
        return React.createElement(
            "div",
            { className: "view-overridden", style: { display: "inherit" } },
            this.props.children,
        );
    }

    protected topology(): NamedNode | undefined {
        return this.props.topology === null
            ? undefined
            : (this.props.topology || this.context.topology);
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

const mapDispatchToProps = (dispatch: Dispatch, ownProps: PropertyProps): DispatchPropTypes => ({
    loadLinkedObject: (href: NamedNode = ownProps.subject as NamedNode, fetch: boolean): LinkAction =>
        dispatch(fetch === false ?
            getLinkedObject(href) :
            fetchLinkedObject(href)),
    reloadLinkedObject: (href: NamedNode = ownProps.subject as NamedNode): LinkAction =>
        dispatch(reloadLinkedObject(href)),
});

// tslint:disable-next-line variable-name
export const LinkedResourceContainer = connect(mapStateToProps, mapDispatchToProps)(LinkedResourceContainerComp);
