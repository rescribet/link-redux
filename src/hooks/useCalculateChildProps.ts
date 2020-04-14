import { isNamedNode } from "@ontologies/core";
import { DEFAULT_TOPOLOGY } from "link-lib";
import React from "react";

import { WithLinkCtxOptions } from "../hocs/withLinkCtx";
import {
  CalculatedChildProps,
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
): CalculatedChildProps<P> {

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
        overrides.reloadLinkedObject = () => {
          const toReload = props.subject || subject;
          if (isNamedNode(toReload)) {
            lrs.queueEntity(toReload, { reload: true });
          }

          return Promise.resolve();
        };
    }

    return Object.assign(
        {},
        props,
        { subject, topology: topology! },
        overrides,
    );
}
