import { RENDER_CLASS_NAME } from "link-lib";
import { NamedNode } from "rdflib";
import * as React from "react";
import { createElement } from "react";
import { useDataInvalidation } from "../hooks/useDataInvalidation";
import { InjectedPropTypes } from "./LinkedResourceContainer";

import { TypableBase, TypableInjectedProps, TypableProps } from "./Typable";
import { withLinkCtx } from "./withLinkCtx";

export interface PropTypes extends TypableProps {
    children?: React.ReactType;
    label?: NamedNode;
}

export interface PropTypesWithInjected extends PropTypes, TypableInjectedProps {}

class TypeComp<U = {}> extends TypableBase<U & PropTypesWithInjected> {
    public static displayName = "Type";

    public render() {
        const {
            label,
            lrs,
            subject,
        } = this.props;

        const notReadyComponent = this.renderLoadingOrError();
        if (notReadyComponent !== undefined) {
            return notReadyComponent;
        }

        const component = lrs.resourcePropertyComponent(
            subject,
            (label || RENDER_CLASS_NAME) as NamedNode,
            this.topology(),
        );
        if (component !== undefined) {
            const {
                children,
                ...rest // tslint:disable-line trailing-comma
            } = this.props as {} & PropTypesWithInjected;

            return createElement(
                component,
                rest,
                children,
            );
        }

        return this.renderNoView();
    }
}

function TypeSubbed<P>(props: P & InjectedPropTypes) {
    const version = useDataInvalidation(props, props.lrs);

    return <TypeComp {...props} linkVersion={version} />;
}

// tslint:disable-next-line: variable-name
export const Type = withLinkCtx(TypeSubbed);
