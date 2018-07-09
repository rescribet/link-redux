import * as React from "react";
import { connect } from "react-redux";
import { LinkStateTree, Omit, SubjectProp, VersionProp } from "../types";

import { linkedObjectVersionByIRI } from "./linkedObjects/selectors";

export const mapStateToProps = (state: LinkStateTree, { subject }: SubjectProp): VersionProp => {
    if (typeof subject === "undefined" || subject === null) {
        throw new Error("[LV] A subject must be given");
    }

    return {
        version: linkedObjectVersionByIRI(state, subject),
    };
};

export function linkedVersion<T extends VersionProp & SubjectProp>(
    component: React.ComponentType<T>,
): React.ComponentType<Omit<T, keyof VersionProp> & SubjectProp> {

    // @ts-ignore
    return connect(mapStateToProps)(component);
}
