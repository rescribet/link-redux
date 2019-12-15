import React from "react";
import { SubjectProp } from "../../types";
import { useLinkRenderContext } from "../withLinkCtx";

export const wrapWithSubject = <P>(WrappedComponent: React.ComponentType<P & Partial<SubjectProp>>) => {
    const Comp = (props: P) => {
        const { subject } = useLinkRenderContext();
        const shared = { ...props, subject };

        return React.createElement(WrappedComponent, shared);
    };
    Comp.displayName = `linkSubject(${WrappedComponent.displayName || WrappedComponent.name})`;

    return Comp;
};
