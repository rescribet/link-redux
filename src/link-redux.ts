import { Requireable } from "prop-types";
import {
    ComponentClass,
    StatelessComponent,
} from "react";

import { linkedSubject } from "./redux/linkedSubject";
import { linkedVersion } from "./redux/linkedVersion";

export {
    getLinkedObjectClass,
    Property,
    PropertyBase,
    RenderStoreProvider,
    TopologyProvider,
} from "./react/components/index";

export { link } from "./redux/link";
export * from "./redux/linkedObjects/actions";
export { linkReducer } from "./redux/linkedObjects/reducer";
export { linkedObjectVersionByIRI } from "./redux/linkedObjects/selectors";
export { linkMiddleware } from "./redux/middleware";

export { Type } from "./redux/Type";
export {
    LinkedResourceContainer,
} from "./redux/LinkedResourceContainer";

export * from "./types";
export * from "./propTypes";

export const lowLevel = {
    linkedSubject,
    linkedVersion,
};
