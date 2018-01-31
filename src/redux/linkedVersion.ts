import * as React from "react";
import { connect } from "react-redux";
import { LinkStateTree, SubjectProp, VersionProp } from "../types";

import { linkedObjectVersionByIRI } from "./linkedObjects/selectors";

const mapStateToProps = (state: LinkStateTree, { subject }: SubjectProp) => {
    if (typeof subject === "undefined") {
        throw new Error("[LS] A subject must be given");
    }

    return {
        version: linkedObjectVersionByIRI(state, subject),
    };
};

export function linkedVersion<T extends VersionProp>(component: React.ComponentType<T>) {
    return connect(mapStateToProps)<T>(component);
}
