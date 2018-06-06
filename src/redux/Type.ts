import { RENDER_CLASS_NAME } from "link-lib";
import { NamedNode } from "rdflib";
import { ReactType } from "react";
import { createElement } from "react";

import { linkedSubject } from "./linkedSubject";
import { linkedVersion } from "./linkedVersion";

import { Typable, TypableProps } from "./Typable";

export interface PropTypes extends TypableProps {
    children: ReactType;
    label?: NamedNode;
}

class TypeComp extends Typable<PropTypes> {
    public static displayName = "Type";

    public render() {
        const { linkedRenderStore } = this.context;

        const notReadyComponent = this.renderLoadingOrError();
        if (notReadyComponent !== undefined) {
            return notReadyComponent;
        }

        const component = linkedRenderStore.resourcePropertyComponent(
            this.props.subject,
            this.props.label || RENDER_CLASS_NAME,
            this.context.topology,
        );
        if (component !== undefined) {
            return createElement(
                component,
                this.props,
                this.props.children,
            );
        }

        return this.renderNoView();
    }
}

// tslint:disable-next-line: variable-name
export const Type = linkedSubject(linkedVersion(TypeComp));
