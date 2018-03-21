import { defaultNS } from "link-lib";
import { ReactType } from "react";
import { createElement } from "react";

import { linkedSubject } from "./linkedSubject";
import { linkedVersion } from "./linkedVersion";

import { Typable, TypableProps } from "./Typable";

export interface PropTypes extends TypableProps {
    children: ReactType;
}

class TypeComp extends Typable<PropTypes, never> {
    public static displayName = "Type";

    public render() {
        const { linkedRenderStore } = this.context;

        const notReadyComponent = this.renderLoadingOrError();
        if (notReadyComponent !== undefined) {
            return notReadyComponent;
        }

        const component = linkedRenderStore.resourceComponent(
            this.props.subject,
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
