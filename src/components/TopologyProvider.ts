import { SomeNode } from "link-lib";
import * as PropTypes from "prop-types";
import * as React from "react";

import { LinkContext, TopologyRenderer, TopologyType } from "../types";

import { Consumer, Provider } from "./withLinkCtx";

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
export class TopologyProvider<T = {}, S = {}> extends React.PureComponent<T, S> {
    public static propTypes = {
        children: PropTypes.node,
    };

    protected className: string | undefined = undefined;
    protected elementType = "div";
    protected topology: TopologyType = null;

    public wrap(children: TopologyRenderer | React.ReactNode | React.ReactNode[]) {
        return React.createElement(
            Consumer,
            null,
            ({ lrs, subject }: LinkContext) =>
                React.createElement(
                    Provider,
                    {
                        value: {
                            lrs,
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
                { className: this.className },
                this.props.children,
            );
        }

        return this.wrap(children);
    }
}
