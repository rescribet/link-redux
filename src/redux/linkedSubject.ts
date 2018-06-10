import * as React from "react";

import { subjectType } from "../propTypes";
import { SubjectProp } from "../types";

export const linkedSubject = <P>(connectedProp: React.ComponentType<P & SubjectProp>):
    React.ComponentType<P & Partial<SubjectProp>> => {

    const displayName = `linkedSubject[${connectedProp.displayName || connectedProp.name}]`;

    class LinkedSubjectComp extends React.Component<P & Partial<SubjectProp>> {
        public static contextTypes = {
            subject: subjectType,
        };

        public static displayName = displayName;

        public render() {
            return React.createElement(
                connectedProp,
                Object.assign(
                    {},
                    this.props,
                    { subject: this.context.subject } as SubjectProp,
                ) as P & SubjectProp,
            );
        }
    }

    return LinkedSubjectComp;
};
