import { node, Requireable } from "prop-types";
import { ReactNode } from "react";
import * as React from "react";

import { topologyType } from "../../propTypes";
import {
    TopologyType,
} from "../../types";

export interface PropTypes {
    children?: ReactNode | ReactNode[];
}

export interface TopologyContext {
    topology: TopologyType;
}

/**
 * Inherit from this component to set the topology.
 *
 * @example
 * ```
 *
 *   class Collection extends TopologyProvider {
 *     this.topology = NS.app('collection')
 *     // Optionally:
 *     this.className = "Collection";
 *     this.elementName = "span";
 *   }
 * ```
 */
export class TopologyProvider<T = {}> extends React.PureComponent<T & PropTypes>
    implements React.ChildContextProvider<TopologyContext> {

    public static childContextTypes = {
        topology: topologyType,
    };
    public static propTypes = {
        children: node,
    };

    protected className: string | undefined = undefined;
    protected elementType = "div";
    protected topology: TopologyType = null;

    public getChildContext(): TopologyContext {
        return {
            topology: this.topology,
        };
    }

    public render() {
        if (this.className !== undefined) {
            return React.createElement(
                this.elementType,
                { className: this.className},
                this.props.children,
            );
        }

        return this.props.children || null;
    }
}
