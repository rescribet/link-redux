import * as React from "react";

import { subjectType } from "../propTypes";

export const linkedSubject = (connectedProp: React.ReactType): React.ReactType => {
    const displayName = typeof connectedProp === "string"
        ? "linkedSubject"
        : `linkedSubject[${connectedProp.displayName || connectedProp.name}]`;

    class LinkedSubjectComp extends React.PureComponent {
        public static contextTypes = {
            subject: subjectType,
        };

        public static displayName = displayName;

        public render() {
            return React.createElement(
                connectedProp,
                { ...this.props, subject: this.context.subject },
            );
        }
    }

    return LinkedSubjectComp;
};
