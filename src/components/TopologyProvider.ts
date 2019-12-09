import React from "react";

import {
    LinkRenderContext,
    TopologyRenderer,
    TopologyType,
} from "../types";

import { Consumer, Provider } from "../hocs/withLinkCtx";

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
export class TopologyProvider<P = {}, S = {}> extends React.Component<P, S> {
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
                { className: this.className, ...(this.props || {}) },
                this.props.children,
            );
        }

        return this.wrap(children);
    }
}
