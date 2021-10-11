import { ComponentRegistration, LazyNNArgument, LinkedRenderStore } from "link-lib";
import React, { ExoticComponent } from "react";

import { link } from "./hocs/link";
import { RegistrableComponent } from "./types";

export type higherOrderWrapper<P> = (c: React.ComponentType<P>) => React.ComponentType<P>;

export function registerExotic<P = {}>(
  comp: ExoticComponent<P>,
  type?: LazyNNArgument,
  property?: LazyNNArgument,
  topology?: LazyNNArgument,
): Array<ComponentRegistration<React.ComponentType<P>>> {
  (comp as any).type = type;
  (comp as any).property = property;
  (comp as any).topology = topology;

  return register(comp as any);
}

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
