import { defaultNS } from "link-lib";
import { Component, ReactType } from "react";
import { createElement } from "react";

import { linkedSubject } from "./linkedSubject";
import { linkedVersion } from "./linkedVersion";

import { lrsType, topologyType } from "../propTypes";
import { Property } from "../react/components/";
import { PropertyProps } from "../types";

export interface PropTypes extends PropertyProps {
    children: ReactType;
}

class TypeComp extends Component<PropTypes> {
    public static contextTypes = {
        linkedRenderStore: lrsType,
        topology: topologyType,
    };
    public static displayName = "Type";

    public render() {
        const { linkedRenderStore } = this.context;

        const storeTypes = linkedRenderStore.getResourceProperties(this.props.subject, defaultNS.rdf("type"));
        const objType = storeTypes.length > 0 ? storeTypes : [linkedRenderStore.defaultType];
        if (objType.length === 0) {
            return null;
        }

        const component = linkedRenderStore.resourceComponent(this.props.subject, this.context.topology);
        if (component !== undefined) {
            return createElement(
                component,
                this.props,
                this.props.children,
            );
        }

        return createElement(
            "div",
            { className: "no-view" },
            createElement(Property, { label: linkedRenderStore.namespaces.schema("name") }),
            createElement("p", null, "We currently don't have a view for this"),
        );
    }
}

// tslint:disable-next-line: variable-name
export const Type = linkedSubject(linkedVersion(TypeComp));
