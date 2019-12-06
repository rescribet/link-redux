import { ComponentRegistration, LinkedRenderStore } from "link-lib";
import React from "react";

import { link } from "./hocs/link";
import { RegistrableComponent } from "./types";

export type higherOrderWrapper<TNeedsProps> = (c: React.ComponentType<TNeedsProps>) => React.ComponentType<TNeedsProps>;

export function register<P>(comp: RegistrableComponent<P>): Array<ComponentRegistration<React.ComponentType<P>>> {

    const reducer = (prev: React.ComponentType<P>, cur: higherOrderWrapper<P>) => cur(prev);
    const wrappedComp = (comp.hocs || []).reduce(reducer, comp);

    const dataBoundComp = comp.mapDataToProps
      ? link(comp.mapDataToProps, comp.linkOpts)(wrappedComp)
      : wrappedComp;

    return LinkedRenderStore.registerRenderer(
        dataBoundComp,
        comp.type,
        comp.property,
        comp.topology,
    );
}
