import * as React from "react";
import { connect } from "react-redux";

import {
    LinkContext,
    LinkContextRecieverProps,
    LinkCtxOverrides,
    LinkReduxLRSType,
    Omit,
    TopologyContextProp,
    TopologyProp, TopologyType,
} from "../types";

import { mapStateToProps } from "./linkedVersion";

export type LinkCtxType<T extends LinkContext> = Omit<T, keyof LinkContext>;

export interface WithLinkCtxOptions {
    [k: string]: boolean;
}

export interface RenderStoreProviderProps {
    children: React.ReactChild;
    value: LinkReduxLRSType;
}

export const { Consumer, Provider } = React.createContext<Partial<LinkContext>>({});

export function RenderStoreProvider({ children, value }: RenderStoreProviderProps) {
    return React.createElement(
        Provider,
        { value: { lrs: value }},
        children,
    );
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
export class TopologyProvider<T = {}, S = {}> extends React.PureComponent<T, S> {
    // public static propTypes = {
    //     children: ReactPropTypes.node,
    // };

    protected className: string | undefined = undefined;
    protected elementType = "div";
    protected topology: TopologyType = null;

    public wrap(children: React.ReactNode | React.ReactNode[]) {
        return React.createElement(Consumer, null, ({ lrs, subject }: LinkContext) =>
            React.createElement(
                Provider,
                {
                    value: {
                        linkedRenderStore: lrs,
                        lrs,
                        subject,
                        topology: this.topology === null ? undefined : this.topology,
                    },
                },
                children,
            ),
        );
    }

    public render() {
        let children = this.props.children || null;

        if (this.className !== undefined) {
            children = React.createElement(
                this.elementType,
                { className: this.className},
                this.props.children,
            );
        }

        return this.wrap(children);
    }
}

const VersionBase = connect(mapStateToProps);

export function withLinkCtx<P extends LinkContextRecieverProps>(
    Component: React.ComponentType<P & Partial<LinkCtxOverrides>>,
    options: WithLinkCtxOptions = {}): React.ComponentType<P & Partial<TopologyProp>> {

    // @ts-ignore
    const VersionComp = VersionBase(Component);

    return (props: P & Partial<LinkCtxOverrides>) => (
        <Consumer>
            {({ lrs, subject, topology }: Partial<LinkContext>) => {
                const overrides: Partial<LinkContext & LinkCtxOverrides> = {};
                if (options.subject) {
                    overrides.subjectCtx = subject;
                    overrides.subject = props.subject;
                }
                if (options.topology) {
                    overrides.topologyCtx = topology;
                    overrides.topology = props.topology;
                }

                const childProps = Object.assign(
                    {},
                    props,
                    { linkedRenderStore: lrs, lrs, subject, topology },
                    overrides,
                );

                const FinalComponent = childProps.subject ? VersionComp : Component;

                return React.createElement(FinalComponent, childProps);
            }}
        </Consumer>
    );
}

export interface LinkedRenderStoreContext {
    /** @deprecated */
    linkedRenderStore: LinkReduxLRSType;
    lrs: LinkReduxLRSType;
}

export function withLRS<P extends LinkedRenderStoreContext>(Component: React.ComponentType<P>):
    React.SFC<Omit<P, keyof LinkedRenderStoreContext>> {

    return (props) => (
        <Consumer>
            {({ lrs }) => {
                if (!lrs) {
                    throw new Error("No LinkedRenderStore provided");
                }

                return <Component {...props} linkedRenderStore={lrs} lrs={lrs} />;
            }}
        </Consumer>
    );
}

export function withTopology<P extends TopologyContextProp>(Component: React.ComponentType<P>):
    React.SFC<Omit<P, keyof TopologyContextProp>> {

    return (props) => (
        <Consumer>
            {({ topology }) => {
                return <Component {...props} topology={topology} />;
            }}
        </Consumer>
    );
}
