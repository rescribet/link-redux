import { ComponentRegistration, LinkedRenderStore } from "link-lib";
import { ReactType } from "react";

import { link } from "./redux/link";
import { RegisterableComponent } from "./types";

export function register<P>(comp: RegisterableComponent<P>): Array<ComponentRegistration<ReactType<P>>> {
    return LinkedRenderStore.registerRenderer(
        comp.mapDataToProps ? link(comp.mapDataToProps)(comp) : comp,
        comp.type,
        comp.property,
        comp.topology,
    );
}
