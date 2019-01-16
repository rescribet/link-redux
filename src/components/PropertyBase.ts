import { SomeNode } from "link-lib";
import * as ReactPropTypes from "prop-types";
import { NamedNode, SomeTerm, Statement } from "rdflib";
import { ReactElement } from "react";
import * as React from "react";
import { normalizeDataSubjects } from "../hooks/useDataInvalidation";

import { labelType, linkedPropType, subjectType } from "../propTypes";
import { LabelType, LinkContext } from "../types";
import { LinkCtx } from "./withLinkCtx";

export interface PropTypes extends LinkContext {
    label: LabelType;
    linkedProp?: SomeTerm;
}

/**
 * @deprecated
 */
export class PropertyBase<T extends PropTypes> extends React.Component<T> {
    public static contextType = LinkCtx;

    public static propTypes = {
        label: labelType,
        linkedProp: linkedPropType,
        subject: subjectType,
    };

    public unsubscribe?: () => void;

    public componentDidMount(): void {
        this.resubscribe();
    }

    public componentDidUpdate(): void {
        this.resubscribe();
    }

    public componentWillUnmount(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    public render(): ReactElement<any> | null {
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

        return this.props.subject !== nextProps.subject;
    }

    protected getLinkedObjectProperty(property?: NamedNode): SomeTerm | undefined {
        if (property === undefined && typeof this.props.linkedProp !== "undefined") {
            return this.props.linkedProp;
        }

        return this.context.lrs.getResourceProperty(
            this.props.subject,
            property || this.props.label,
        );
    }

    protected getLinkedObjectPropertyRaw(property?: SomeNode): Statement[] {
        return this.context.lrs.getResourcePropertyRaw(
            this.props.subject,
            property || this.props.label,
        );
    }

    protected resubscribe(props: T = this.props) {
        let unsubscribe;
        const subs = normalizeDataSubjects(props);
        if (subs.length > 0) {
            unsubscribe = this.context.lrs.subscribe({
                callback: () => this.forceUpdate(),
                markedForDelete: false,
                onlySubjects: true,
                subjectFilter: subs,
            });
        }
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        this.unsubscribe = unsubscribe;
    }
}
