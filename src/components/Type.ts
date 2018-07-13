import { RENDER_CLASS_NAME } from "link-lib";
import { NamedNode } from "rdflib";
import * as React from "react";
import { createElement } from "react";

import { TypableBase, TypableInjectedProps, TypableProps } from "./Typable";
import { withLinkCtx } from "./withLinkCtx";

export interface PropTypes extends TypableProps {
    children?: React.ReactType;
    label?: NamedNode;
}

export interface PropTypesWithInjected extends PropTypes, TypableInjectedProps {}

class TypeComp extends TypableBase<PropTypesWithInjected> {
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
            label || RENDER_CLASS_NAME,
            this.props.topology,
        );
        if (component !== undefined) {
            const {
                children,
                ...rest // tslint:disable-line trailing-comma
            } = this.props;

            return createElement(
                component,
                rest,
                children,
            );
        }

        return this.renderNoView();
    }
}

// tslint:disable-next-line: variable-name
export const Type = withLinkCtx(TypeComp);
