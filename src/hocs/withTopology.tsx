import React from "react";

import { LinkRenderCtx } from "../contexts/LinkRenderCtx";
import { Omit, TopologyContextProp } from "../types";

export function withTopology<P extends TopologyContextProp>(Component: React.ComponentType<P>):
    React.FunctionComponent<Omit<P, keyof TopologyContextProp>> {

    return (props: Omit<P, keyof TopologyContextProp>) => (
        <LinkRenderCtx.Consumer>
            {({ topology }) => {
                const merged = { ...props, topology } as P;

                return <Component {...merged} />;
            }}
        </LinkRenderCtx.Consumer>
    );
}
