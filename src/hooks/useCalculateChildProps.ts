import { NamedNode } from "@ontologies/core";
import { DEFAULT_TOPOLOGY } from "link-lib";
import React from "react";

import { WithLinkCtxOptions } from "../hocs/withLinkCtx";
import {
    LinkCtxOverrides,
    LinkedRenderStoreContext,
    LinkRenderContext,
    PassableRef,
    SubjectProp,
    TopologyProp,
} from "../types";

import { useLRS } from "./useLRS";

type Overrides<R> = Partial<
    LinkRenderContext
    & LinkedRenderStoreContext
    & LinkCtxOverrides
    & React.RefAttributes<R>
    & { innerRef: undefined }
    >;

export function useCalculateChildProps<P, R = any>(
    props: P & Partial<SubjectProp & TopologyProp & PassableRef<R>>,
    context: LinkRenderContext,
    options: WithLinkCtxOptions = {},
): P & LinkRenderContext & Partial<LinkedRenderStoreContext> & Partial<LinkCtxOverrides> {

    const lrs = useLRS();
    const { subject, topology } = context;
    const overrides: Overrides<R> = {};

    if (typeof props.innerRef !== "undefined") {
        overrides.ref = props.innerRef;
        overrides.innerRef = undefined;
    }

    if (options.subject) {
        overrides.subjectCtx = subject;
        overrides.subject = props.subject;
    }
    if (options.topology) {
        overrides.topologyCtx = topology;
        overrides.topology = props.topology === null ? DEFAULT_TOPOLOGY : props.topology;
    }
    if (options.lrs) {
        overrides.lrs = lrs;
    }
    if (options.helpers) {
        overrides.reset = options.helpers.reset;
        overrides.reloadLinkedObject = () =>
            lrs.getEntity((props.subject || subject) as NamedNode, { reload: true });
    }

    return Object.assign(
        {},
        props,
        { subject, topology: topology! },
        overrides,
    );
}
