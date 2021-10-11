import rdfFactory, { doc, Node, TermType } from "@ontologies/core";
import { equals, id, normalizeType } from "link-lib";
import React from "react";

import { reduceDataSubjects } from "../helpers";
import { DataInvalidationProps, LaxIdentifer, SubjectType } from "../types";

import { useLRS } from "./useLRS";

/**
 * The subjects this component subscribes to.
 * Includes the subject by default.
 */
export function normalizeDataSubjects(props: Partial<DataInvalidationProps>): SubjectType[] {
    if (!(props.subject || props.dataSubjects)) {
        return [];
    }

    const result = [];
    if (props.subject) {
      result.push(props.subject);
    }
    if (props.dataSubjects) {
        result.push(...normalizeType(props.dataSubjects));
    }

    if (props.subject?.termType === TermType.NamedNode) {
        const document = rdfFactory.namedNode(doc(props.subject));
        if (!equals(document, props.subject)) {
            result.push(document);
        }
    }

    return result;
}

/**
 * Re-renders when one of the given {resources} changes in the store.
 *
 * Should only be necessary when using imperative code.
 */
export function useDataInvalidation(subjects: LaxIdentifer | LaxIdentifer[]): number {
    const resources = normalizeType(subjects!).filter<Node>(Boolean as any);
    const lrs = useLRS();

    const highestUpdate = () => Math.max(...resources
      .map((s) => lrs.store.changeTimestamps[id(lrs.store.canon(s))] || 0));

    const subId = resources.length > 0 ? id(lrs.store.canon(resources[0])) : undefined;
    const [lastUpdate, setInvalidate] = React.useState<number>(highestUpdate());

    function handleStatusChange(_: unknown, lastUpdateAt?: number) {
        setInvalidate(lastUpdateAt!);
    }

    React.useEffect(() => {
        return lrs.subscribe({
            callback: handleStatusChange,
            lastUpdateAt: undefined,
            markedForDelete: false,
            onlySubjects: true,
            subjectFilter: resources,
        });
    }, [
      lrs,
      subId,
      resources.length,
      reduceDataSubjects(resources),
    ]);

    return lastUpdate;
}
