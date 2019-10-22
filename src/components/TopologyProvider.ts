import * as PropTypes from "prop-types";
import * as React from "react";

import {
    LinkRenderContext,
    TopologyRenderer,
    TopologyType,
} from "../types";

import { Consumer, Provider } from "../hocs/withLinkCtx";

export interface TopologyProviderProps {
    elementProps?: object;
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
export class TopologyProvider<T extends TopologyProviderProps = {}, S = {}> extends React.Component<T, S> {
    public static propTypes = {
        children: PropTypes.node,
        elementProps: PropTypes.object,
    };

    protected className: string | undefined = undefined;
    protected elementType = "div";
    protected topology: TopologyType = null;

    public wrap(children: TopologyRenderer | React.ReactNode | React.ReactNode[]) {
        return React.createElement(
            Consumer,
            null,
            ({ subject }: LinkRenderContext) =>
                React.createElement(
                    Provider,
                    {
                        value: {
                            subject,
                            topology: this.topology === null ? undefined : this.topology,
                        },
                    },
                    typeof children === "function" ? (children as TopologyRenderer)(subject) : children,
                ),
            );
    }

    public render() {
        let children = this.props.children || null;

        if (this.className !== undefined) {
            children = React.createElement(
                this.elementType,
                { className: this.className, ...(this.props.elementProps || {}) },
                this.props.children,
            );
        }

        return this.wrap(children);
    }
}
