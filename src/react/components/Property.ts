import { SomeNode } from "link-lib";
import { Requireable } from "prop-types";
import * as React from "react";

import { lrsType, topologyType } from "../../propTypes";
import { LinkedResourceContainer as LRC, PropTypes as LRSPropTypes } from "../../redux/LinkedResourceContainer";
import { linkedSubject } from "../../redux/linkedSubject";
import { linkedVersion } from "../../redux/linkedVersion";
import {
    LabelType,
    LinkedPropType,
    LinkReduxLRSType,
    PropertyProps,
    SubjectProp,
    TopologyType,
} from "../../types";

export interface PropTypes extends PropertyProps {
    forceRender?: boolean;
    label: LabelType;
    linkedProp: LinkedPropType;
}

export interface ContextTypes {
    linkedRenderStore: LinkReduxLRSType;
    topology: TopologyType;
}

const nodeTypes = ["NamedNode", "BlankNode"];

export function getLinkedObjectClass(props: PropTypes,
                                     { linkedRenderStore, topology }: ContextTypes): React.ReactType | undefined {
    return linkedRenderStore.resourcePropertyComponent(
        props.subject,
        props.label,
        topology === null ? undefined : topology,
    );
}

export class PropertyComp extends React.PureComponent<PropTypes> {
    public static contextTypes = {
        linkedRenderStore: lrsType,
        topology: topologyType,
    };
    public static defaultProps = {
        forceRender: false,
        linkedProp: undefined,
    };
    public static displayName = "Property";

    public render() {
        const { forceRender } = this.props;
        const objRaw = this.props.linkedProp || this.context.linkedRenderStore.getResourceProperty(
            this.props.subject,
            this.props.label,
        );

        const obj = objRaw && objRaw.value;
        if (obj === undefined && !forceRender) {
            return null;
        }

        const component = getLinkedObjectClass(this.props, this.context);
        if (component) {
            return React.createElement(component, { ...this.props, linkedProp: objRaw });
        }
        if (typeof objRaw !== "undefined" && nodeTypes.includes(objRaw.termType)) {
            const lrcProps = { ...this.props, subject: objRaw as SomeNode };

            return React.createElement(LRC, lrcProps);
        }
        if (obj) {
            return React.createElement("div", null, obj);
        }

        return null;
    }
}

const connectedProp = linkedVersion(PropertyComp);
connectedProp.displayName = "ConnectedProp";

// tslint:disable-next-line: variable-name
export const Property = linkedSubject(connectedProp);
