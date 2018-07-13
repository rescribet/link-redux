import * as React from "react";

import { Omit, TopologyContextProp } from "../types";

import { Consumer } from "./withLinkCtx";

export function withTopology<P extends TopologyContextProp>(Component: React.ComponentType<P>):
    React.SFC<Omit<P, keyof TopologyContextProp>> {

    return (props) => (
        <Consumer>
            {({ topology }) => <Component {...props} topology={topology} />}
        </Consumer>
    );
}
