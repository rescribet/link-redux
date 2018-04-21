import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { LinkStateTree, SubjectProp, VersionProp } from "../types";

import { linkedObjectVersionByIRI } from "./linkedObjects/selectors";

export const mapStateToProps = (state: LinkStateTree, { subject }: SubjectProp): VersionProp => {
    if (typeof subject === "undefined" || subject === null) {
        throw new Error("[LS] A subject must be given");
    }

    return {
        version: linkedObjectVersionByIRI(state, subject),
    };
};

export function linkedVersion<T extends VersionProp>(
    component: React.ComponentType<T & DispatchProp<any> & SubjectProp>,
) {
    return connect(mapStateToProps)<T & DispatchProp<any> & SubjectProp>(component);
}
