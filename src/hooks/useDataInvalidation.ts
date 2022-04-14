import rdfFactory, { doc, Node, TermType } from "@ontologies/core";
import { equals, normalizeType } from "link-lib";
import React from "react";

import { useMemoizedDataSubjects } from "../helpers";
import { DataInvalidationProps, LaxIdentifier, SubjectType } from "../types";

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
        const document = doc(props.subject);
        if (document !== props.subject.value) {
            result.push(rdfFactory.namedNode(document));
        }
    }

    return result;
}

const highestUpdate = (timestamps: number[]) => Math.max(...timestamps);

/**
 * Re-renders when one of the given {resources} changes in the store.
 *
 * Should only be necessary when using imperative code.
 */
export function useDataInvalidation(subjects: LaxIdentifier | LaxIdentifier[]): number {
    const resources = normalizeType(subjects!).filter<Node>(Boolean as any).map((n) => n.value);
    const lrs = useLRS();

    const store = lrs.store.getInternalStore().store;

    const getTimestamps = () => resources
        .map((s) => store.journal.get(store.primary(s)).lastUpdate ?? 0);
    const [timestamps, setTimestamps] = React.useState<number[]>(getTimestamps);
    const [lastUpdate, setInvalidate] = React.useState<number>(highestUpdate(timestamps));

    const subId = resources.length > 0 ? store.primary(resources[0]) : undefined;

    function calculateTimestamp() {
        const nextTimestamps = getTimestamps();
        if (timestamps.length !== nextTimestamps.length || timestamps.some((p, i) => !equals(p, nextTimestamps[i]))) {
            const newHighest = highestUpdate(nextTimestamps);
            const newTimestamp = newHighest !== lastUpdate ?
              newHighest :
              (nextTimestamps.find((val) => !timestamps.includes(val)));

            if (newTimestamp) {
                setInvalidate(newTimestamp);
            }
            setTimestamps(nextTimestamps);
        }
    }

    function handleStatusChange(_: unknown, __?: number) {
        calculateTimestamp();
    }

    React.useEffect(() => {
        calculateTimestamp();

        return lrs.subscribe({
            callback: handleStatusChange,
            lastUpdateAt: undefined,
            markedForDelete: false,
            subjectFilter: resources,
        });
    }, [
      lrs,
      subId,
      resources.length,
      useMemoizedDataSubjects(resources),
    ]);

    return lastUpdate;
}
