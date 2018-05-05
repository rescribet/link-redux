import { Requireable } from "prop-types";
import { ReactElement } from "react";
import * as React from "react";

import { lrsType } from "../../propTypes";

import { LinkReduxLRSType } from "../../types";

export interface PropTypes {
    children?: React.ReactType | ReactElement<any>;
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
