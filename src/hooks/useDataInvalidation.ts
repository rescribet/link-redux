import rdfFactory, { doc, TermType } from "@ontologies/core";
import { normalizeType, SomeNode } from "link-lib";
import React from "react";
import { reduceDataSubjects } from "../helpers";

import { DataInvalidationProps, SubjectType } from "../types";

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
        if (!rdfFactory.equals(document, props.subject)) {
            result.push(document);
        }
    }

    return result;
}

/**
 * Re-renders when one of the given {resources} changes in the store.
 */
export function useDataInvalidation(subjects: undefined | SomeNode | SomeNode[]): number {
    const resources = normalizeType(subjects!).filter(Boolean);
    const lrs = useLRS();
    const subId = resources.length > 0 ? rdfFactory.id(lrs.store.canon(resources[0])) : undefined;
    const [lastUpdate, setInvalidate] = React.useState<number>(
        (lrs as any).store.changeTimestamps[subId],
    );

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
      subId,
      reduceDataSubjects(resources),
    ]);

    return lastUpdate;
}
