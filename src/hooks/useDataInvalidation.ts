import rdfFactory, { doc, Node, TermType } from "@ontologies/core";
import { normalizeType } from "link-lib";
import React from "react";

import { useMemoizedDataSubjects } from "../helpers";
import { DataInvalidationProps, LaxIdentifier, SubjectType } from "../types";

import { useLRS } from "./useLRS";

const NO_SUBJECTS: SubjectType[] = [];

/**
 * The subjects this component subscribes to.
 * Includes the subject by default.
 */
export function normalizeDataSubjects(props: Partial<DataInvalidationProps>): SubjectType[] {
    if (!(props.subject || props.dataSubjects)) {
        return NO_SUBJECTS;
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

    if (result.length === 0) {
        return NO_SUBJECTS;
    }
    if (result.length === 1) {
        return result[0];
    }

    return result;
}

/**
 * Re-renders when one of the given {subjects} changes in the store.
 *
 * Should only be necessary when using imperative code.
 */
export function useDataInvalidation(subjects: LaxIdentifier | LaxIdentifier[]): number {
    const resources = normalizeType(subjects!).filter<Node>(Boolean as any).map((n) => n.value);
    const memoizedResources = useMemoizedDataSubjects(resources);
    const lrs = useLRS();

    const store = lrs.store.getInternalStore().store;
    const highestUpdate = () => Math.max(...resources
      .map((s) => store.journal.get(store.primary(s)).lastUpdate ?? 0));

    const subId = resources.length > 0 ? store.primary(resources[0]) : undefined;
    const isMountedRef = React.useRef<boolean>(false);
    const [lastUpdate, setInvalidate] = React.useState<number>(highestUpdate);

    function handleStatusChange(_: unknown, lastUpdateAt?: number) {
        setInvalidate(lastUpdateAt!);
    }

    React.useEffect(() => {
        if (isMountedRef.current) {
            setInvalidate(Date.now());
        } else {
            isMountedRef.current = true;
        }
    }, [memoizedResources]);

    React.useEffect(() => {
        return lrs.subscribe({
            callback: handleStatusChange,
            lastUpdateAt: undefined,
            markedForDelete: false,
            subjectFilter: resources,
        });
    }, [
      lrs,
      subId,
      memoizedResources,
    ]);

    return lastUpdate;
}
