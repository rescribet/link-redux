import { ComponentRegistration, LinkedRenderStore } from "link-lib";
import { ComponentClass, ComponentType } from "react";
import { InferableComponentEnhancerWithProps } from "react-redux";

import { link } from "./components/link";
import { RegistrableComponent } from "./types";

export type higherOrderWrapper<TNeedsProps> = InferableComponentEnhancerWithProps<TNeedsProps, TNeedsProps>;

export function register<P>(comp: RegistrableComponent<P>, ...hocs: Array<higherOrderWrapper<P>>):
    Array<ComponentRegistration<ComponentType<P>>> {

    // @ts-ignore
    const reducer = (prev: ComponentClass<P>, cur: higherOrderWrapper<P>) => cur(prev);
    // @ts-ignore
    const wrappedComp = (comp.hocs || hocs).reduce(reducer, comp);

    const dataBoundComp = comp.mapDataToProps ? link(comp.mapDataToProps, comp.linkOpts)(wrappedComp) : wrappedComp;

    return LinkedRenderStore.registerRenderer(
        dataBoundComp,
        comp.type,
        comp.property,
        comp.topology,
    );
}
