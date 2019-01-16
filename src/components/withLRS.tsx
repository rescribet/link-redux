import hoistNonReactStatics from "hoist-non-react-statics";
import * as React from "react";

import { LinkedRenderStoreContext, Omit } from "../types";

import { Consumer } from "./withLinkCtx";

export function withLRS<P extends LinkedRenderStoreContext>(Component: React.ComponentType<P>):
    React.FunctionComponent<Omit<P, keyof LinkedRenderStoreContext>> {

    const Comp = (props: Omit<P, keyof LinkedRenderStoreContext>) => (
        <Consumer>
            {({ lrs }) => {
                if (!lrs) {
                    throw new Error("No LinkedRenderStore provided");
                }

                return <Component {...props as P} lrs={lrs} />;
            }}
        </Consumer>
    );

    return hoistNonReactStatics(Comp, Component);
}
