import { SomeNode } from "link-lib";
import * as ReactPropTypes from "prop-types";
import { NamedNode, SomeTerm, Statement } from "rdflib";
import * as React from "react";

import { labelType, linkedPropType, subjectType } from "../../propTypes";
import { LabelType, LinkReduxLRSType, SubjectProp } from "../../types";

export interface PropTypes extends SubjectProp {
    label: LabelType;
    linkedProp?: SomeTerm;
    version?: string;
}

export class PropertyBase extends React.Component<PropTypes> {
    public static contextTypes = {
        linkedRenderStore: ReactPropTypes.object,
    };
    public static propTypes = {
        label: labelType.isRequired,
        linkedProp: linkedPropType,
        subject: subjectType,
        version: ReactPropTypes.string,
    };

    public render() {
        const prop = this.getLinkedObjectProperty();

        return React.createElement(
            "span",
            null,
            `PropBase: ${prop && prop.value}`,
        );
    }

    public shouldComponentUpdate(nextProps: PropTypes) {
        if (nextProps.label === undefined) {
            return false;
        }

        return this.props.subject !== nextProps.subject ||
            this.props.version !== nextProps.version;
    }

    protected getLinkedObjectProperty(property?: NamedNode): SomeTerm | undefined {
        if (property === undefined && typeof this.props.linkedProp !== "undefined") {
            return this.props.linkedProp;
        }

        return this.context.linkedRenderStore.getResourceProperty(
            this.props.subject,
            property || this.props.label,
        );
    }

    protected getLinkedObjectPropertyRaw(property?: SomeNode): Statement[] | undefined {
        return this.context.linkedRenderStore.getResourcePropertyRaw(
            this.props.subject,
            property || this.props.label,
        );
    }
}
