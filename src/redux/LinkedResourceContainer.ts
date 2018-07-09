import * as ReactPropTypes from "prop-types";
import { NamedNode } from "rdflib";
import { SFC } from "react";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import { subjectType, topologyType } from "../propTypes";
import {
    LinkAction,
    LinkStateTree,
    LoadLinkedObject,
    PropertyProps,
    ReloadLinkedObject,
    SubjectProp,
} from "../types";

import { fetchLinkedObject, getLinkedObject, reloadLinkedObject } from "./linkedObjects/actions";
import { linkedObjectVersionByIRI } from "./linkedObjects/selectors";
import { TypableBase, TypableInjectedProps, TypableProps } from "./Typable";
import { withLinkCtx } from "./withLinkCtx";

export interface DispatchPropTypes {
    loadLinkedObject: LoadLinkedObject;
    reloadLinkedObject: ReloadLinkedObject;
}

export interface PropTypes extends TypableProps {
    fetch?: boolean;
    forceRender?: boolean;
}

export interface InjectedPropTypes extends PropTypes, DispatchPropTypes, TypableInjectedProps {}

// const propTypes = {
//     children: ReactPropTypes.node,
//     fetch: ReactPropTypes.bool,
//     forceRender: ReactPropTypes.bool,
//     loadLinkedObject: ReactPropTypes.func,
//     onError: ReactPropTypes.oneOfType([
//         ReactPropTypes.element,
//         ReactPropTypes.func,
//     ]),
//     onLoad: ReactPropTypes.oneOfType([
//         ReactPropTypes.element,
//         ReactPropTypes.func,
//     ]),
//     reloadLinkedObject: ReactPropTypes.func,
//     subject: subjectType.isRequired,
//     topology: topologyType,
//     version: ReactPropTypes.string,
// };

const nodeTypes = ["NamedNode", "BlankNode"];

class LinkedResourceContainerComp<P extends InjectedPropTypes> extends TypableBase<P> {
    public static defaultProps = {
        children: undefined,
        forceRender: false,
        onError: undefined,
        onLoad: undefined,
        topology: undefined,
    };
    public static displayName = "LinkedResourceContainer";
    // public static propTypes = propTypes;

    public componentWillMount() {
        this.loadLinkedObject();
    }

    public componentWillReceiveProps(nextProps: P) {
        if (this.props.subject !== nextProps.subject) {
            this.loadLinkedObject(nextProps);
        }
    }

    public render() {
        const { lrs } = this.props;
        if (this.props.forceRender && this.props.children) {
            return this.renderChildren();
        }

        const notReadyComponent = this.renderLoadingOrError();
        if (notReadyComponent !== undefined) {
            return notReadyComponent;
        }

        if (this.props.children) {
            return this.renderChildren();
        }
        const component = lrs.resourceComponent(
            this.props.subject,
            this.topology(),
        );
        if (component !== undefined) {
            return this.wrapContext(React.createElement(component, this.props));
        }

        return this.renderNoView();
    }

    protected renderChildren() {
        return this.wrapContext(React.createElement(React.Fragment, null, this.props.children));
    }

    private loadLinkedObject(props: P = this.props): void {
        const data = this.data(props);
        if (data.length === 0) {
            const subject = this.subject(props);
            if (subject.termType === "BlankNode") {
                throw new TypeError("Cannot load a blank node since it has no defined way to be resolved.");
            }
            this.props.loadLinkedObject((subject as NamedNode), !!props.fetch || true);
        }
    }
}

export { LinkedResourceContainerComp };

const mapStateToProps = <P>(state: LinkStateTree, { subject }: P & SubjectProp) => {
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

const mapDispatchToProps = <P>(dispatch: Dispatch, ownProps: P & TypableInjectedProps): DispatchPropTypes => ({
    loadLinkedObject: (href: NamedNode = ownProps.subject as NamedNode, fetch: boolean): LinkAction =>
        dispatch(fetch === false ?
            getLinkedObject(href) :
            fetchLinkedObject(href)),
    reloadLinkedObject: (href: NamedNode = ownProps.subject as NamedNode): LinkAction =>
        dispatch(reloadLinkedObject(href)),
});

const conn = connect(mapStateToProps, mapDispatchToProps);

export const LinkedResourceContainerUnwrapped = conn(LinkedResourceContainerComp);

// The actual value of the `any` placeholder would be the props interface of the component which will
// be rendered, but we can't know that (yet).
// tslint:disable-next-line variable-name
export const LinkedResourceContainer = withLinkCtx<any>(
    LinkedResourceContainerUnwrapped,
    {
        subject: true,
        topology: true,
    },
);
