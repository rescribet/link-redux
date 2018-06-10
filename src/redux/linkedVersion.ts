import * as React from "react";
import { connect, Shared } from "react-redux";
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

const conn = connect(mapStateToProps, null);

export function linkedVersion<
    TOwnProps extends Shared<SubjectProp, VersionProp>
>(component: React.ComponentType<TOwnProps & VersionProp>) {
    return conn(component);
}
