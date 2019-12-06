import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";

import { useLRS } from "../hooks/useLRS";
import { LinkedRenderStoreContext, Omit } from "../types";

export function withLRS<P extends LinkedRenderStoreContext>(Component: React.ComponentType<P>):
    React.FunctionComponent<Omit<P, keyof LinkedRenderStoreContext>> {

    const Comp = (props: Omit<P, keyof LinkedRenderStoreContext>) => {
        const lrs = useLRS();

        return <Component {...props as P} lrs={lrs} />;
    };

    return hoistNonReactStatics(Comp, Component);
}
