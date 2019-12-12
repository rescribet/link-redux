import { ComponentRegistration, LinkedRenderStore } from "link-lib";
import React from "react";

import { link } from "./hocs/link";
import { RegistrableComponent } from "./types";

export type higherOrderWrapper<P> = (c: React.ComponentType<P>) => React.ComponentType<P>;

export function register<P>(comp: RegistrableComponent<P>):
  Array<ComponentRegistration<React.ComponentType<P>>> {
  // @ts-ignore
  const wrappedComp = (comp.hocs || []).reduce(
    (prev: React.ComponentType<P>, cur: higherOrderWrapper<P>) => cur(prev),
    comp,
  );

  const dataBoundComp = link(comp.mapDataToProps, comp.linkOpts)(wrappedComp);

  return LinkedRenderStore.registerRenderer<React.ComponentType<any>>(
    dataBoundComp,
    comp.type,
    comp.property,
    comp.topology,
  );
}
