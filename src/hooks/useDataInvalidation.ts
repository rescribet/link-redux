import rdfFactory, { doc, TermType } from "@ontologies/core";
import { normalizeType } from "link-lib";
import React from "react";

import { equals, id } from "../factoryHelpers";
import { DataInvalidationProps, SubjectType } from "../types";

import { useLRS } from "./useLRS";

/**
 * The subjects this component subscribes to.
 * Includes the subject by default.
 */
export function normalizeDataSubjects(props: DataInvalidationProps): SubjectType[] {
    if (!(props.subject || props.dataSubjects)) {
        return [];
    }

    const result = [props.subject];
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
 * Re-renders when {props.subject} or a resource mentioned in {props.dataSubjects} changes in the store.
 *
 * Be sure to keep undefined values in subject or dataSubjects to ensure useEffect DependencyList consistency.
 */
export function useDataInvalidation(props: DataInvalidationProps) {
    const lrs = useLRS();
    const subId = props.subject ? id(lrs.store.canon(props.subject)) : -1;
    const [lastUpdate, setInvalidate] = React.useState<number>(
        (lrs as any).store.changeTimestamps[subId],
    );

    function handleStatusChange(_: unknown, lastUpdateAt?: number) {
        setInvalidate(lastUpdateAt!);
    }

    let subjSum = 0;
    if (Array.isArray(props.dataSubjects)) {
      for (let i = 0; i < props.dataSubjects.length; i++) {
        if (props.dataSubjects[i]) {
          subjSum += id(props.dataSubjects[i]);
        }
      }
    } else if (props.dataSubjects) {
      subjSum += id(props.dataSubjects);
    }

    React.useEffect(() => {
        const subscriptionSubjects = normalizeDataSubjects(props);

        return lrs.subscribe({
            callback: handleStatusChange,
            lastUpdateAt: undefined,
            markedForDelete: false,
            onlySubjects: true,
            subjectFilter: subscriptionSubjects.filter(Boolean),
        });
    }, [
      subId,
      subjSum,
    ]);

    return lastUpdate;
}
