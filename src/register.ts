import { ComponentRegistration, LinkedRenderStore } from "link-lib";
import { ComponentType } from "react";
import { InferableComponentEnhancerWithProps } from "react-redux";

import { link } from "./redux/link";
import { RegistrableComponent } from "./types";

export type higherOrderWrappers = Array<InferableComponentEnhancerWithProps<any, any>>;

export function register<P>(comp: RegistrableComponent<P>, ...hocs: higherOrderWrappers):
    Array<ComponentRegistration<ComponentType<P>>> {

    const dataBoundComp = comp.mapDataToProps ? link(comp.mapDataToProps, comp.linkOpts)<P>(comp) : comp;
    const wrappedComp = hocs.reduce<ComponentType<P>>((prev, cur) => cur(prev), dataBoundComp);

    return LinkedRenderStore.registerRenderer(
        wrappedComp,
        comp.type,
        comp.property,
        comp.topology,
    );
}
