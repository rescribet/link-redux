import rdfFactory, { BlankNode, doc, NamedNode, TermType } from "@ontologies/core";
import { normalizeType } from "link-lib";
import React from "react";

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
        if (!rdfFactory.equals(document, props.subject)) {
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
    const subId = props.subject ? rdfFactory.id(lrs.store.canon(props.subject)) : undefined;
    const [lastUpdate, setInvalidate] = React.useState<number>(
        (lrs as any).store.changeTimestamps[subId],
    );

    function handleStatusChange(_: unknown, lastUpdateAt?: number) {
        setInvalidate(lastUpdateAt!);
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
      normalizeType(props.dataSubjects)
        .filter<NamedNode | BlankNode>(Boolean as any)
        .map<number>((n: NamedNode | BlankNode) => rdfFactory.id(n))
        .reduce((a: number, b: number) => a + b, 0),
    ]);

    return lastUpdate;
}
