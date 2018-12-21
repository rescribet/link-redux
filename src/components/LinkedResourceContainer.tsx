import * as ReactPropTypes from "prop-types";
import { NamedNode } from "rdflib";
import * as React from "react";
import { normalizeDataSubjects } from "../hooks/useDataInvalidation";

import { subjectType, topologyType } from "../propTypes";
import { DataInvalidationProps } from "../types";

import { TypableBase, TypableInjectedProps, TypableProps } from "./Typable";
import { withLinkCtx } from "./withLinkCtx";

export interface PropTypes extends TypableProps {
    fetch?: boolean;
    forceRender?: boolean;
}

export interface InjectedPropTypes extends PropTypes, DataInvalidationProps, TypableInjectedProps {}

const propTypes = {
    children: ReactPropTypes.node,
    dataSubjects: ReactPropTypes.arrayOf(subjectType),
    fetch: ReactPropTypes.bool,
    forceRender: ReactPropTypes.bool,
    loadLinkedObject: ReactPropTypes.func,
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
};

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

    public unsubscribe?: () => void;

    public componentDidMount() {
        this.loadLinkedObject();
    }

    public componentDidUpdate(prevProps: Readonly<P>): void {
    if (this.props.subject !== prevProps.subject) {
            this.loadLinkedObject(this.props);
        }
    }

    public componentWillUnmount(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
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
        const unsubscribe = props.lrs.subscribe({
            // Overriding the props might result in an invariant since the forceUpdate closure is evaluated later.
            callback: () => this.forceUpdate(),
            markedForDelete: false,
            onlySubjects: true,
            subjectFilter: normalizeDataSubjects(props),
        });
        // TODO: If this can be in componentWillReceiveProps, we can check if the subs have changed
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        this.unsubscribe = unsubscribe;
        const subject = this.subject(props);
        if (this.willLoadObject(props)) {
            if (subject.termType === "BlankNode") {
                throw new TypeError("Cannot load a blank node since it has no defined way to be resolved.");
            }
            if (!!props.fetch || true) {
                this.props.lrs.getEntity((subject as NamedNode));
            } else {
                this.props.lrs.tryEntity((subject as NamedNode));
            }
        }
    }
}

export { LinkedResourceContainerComp };

// The actual value of the `any` placeholder would be the props interface of the component which will
// be rendered, but we can't know that (yet).
// tslint:disable-next-line variable-name
export const LinkedResourceContainer = withLinkCtx<any>(
    LinkedResourceContainerComp,
    {
        subject: true,
        topology: true,
    },
);
