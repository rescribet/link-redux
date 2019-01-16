import { ComponentRegistration, LinkedRenderStore } from "link-lib";
import { ComponentClass, ComponentType, memo } from "react";

import { link } from "./components/link";
import { RegistrableComponent } from "./types";

export type higherOrderWrapper<TNeedsProps> = (c: ComponentType<TNeedsProps>) => ComponentType<TNeedsProps>;

export function register<P>(comp: RegistrableComponent<P>, ...hocs: Array<higherOrderWrapper<P>>):
    Array<ComponentRegistration<ComponentType<P>>> {

    let renderComp: ComponentType<any> = comp;
    if (typeof comp === "function") {
        renderComp = memo(comp);
    }

    const reducer = (prev: ComponentClass<P>, cur: higherOrderWrapper<P>) => cur(prev);
    // @ts-ignore
    const wrappedComp = (comp.hocs || hocs).reduce(reducer, renderComp);

    const dataBoundComp = comp.mapDataToProps ? link(comp.mapDataToProps, comp.linkOpts)(wrappedComp) : wrappedComp;

    return LinkedRenderStore.registerRenderer(
        dataBoundComp,
        comp.type,
        comp.property,
        comp.topology,
    );
}
