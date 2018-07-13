import { ComponentRegistration, LinkedRenderStore } from "link-lib";
import { ComponentClass, ComponentType } from "react";
import { InferableComponentEnhancerWithProps } from "react-redux";

import { link } from "./components/link";
import { RegistrableComponent } from "./types";

export type higherOrderWrapper<TNeedsProps> = InferableComponentEnhancerWithProps<TNeedsProps, TNeedsProps>;

export function register<P>(comp: RegistrableComponent<P>, ...hocs: Array<higherOrderWrapper<P>>):
    Array<ComponentRegistration<ComponentType<P>>> {

    const dataBoundComp = comp.mapDataToProps ? link(comp.mapDataToProps, comp.linkOpts)(comp) : comp;

    const reducer = (prev: ComponentClass<P>, cur: higherOrderWrapper<P>) => cur(prev);
    // @ts-ignore
    const wrappedComp = hocs.reduce(reducer, dataBoundComp);

    return LinkedRenderStore.registerRenderer(
        wrappedComp,
        comp.type,
        comp.property,
        comp.topology,
    );
}
