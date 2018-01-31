import { Requireable } from "prop-types";
import * as React from "react";

import { lrsType } from "../../propTypes";

import { LinkReduxLRSType } from "../../types";

export interface PropTypes {
    children?: React.ReactType;
    linkedRenderStore: LinkReduxLRSType;
}

export interface LinkedRenderStoreContext {
    linkedRenderStore: LinkReduxLRSType;
}

export class RenderStoreProvider
    extends React.Component<PropTypes>
    implements React.ChildContextProvider<LinkedRenderStoreContext> {

    public static childContextTypes = {
        linkedRenderStore: lrsType,
    };

    public getChildContext(): LinkedRenderStoreContext {
        return {
            linkedRenderStore: this.props.linkedRenderStore,
        };
    }

    public render() {
        return this.props.children;
    }
}
