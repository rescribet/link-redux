import rdfFactory, { doc, Node, TermType } from "@ontologies/core";
import { normalizeType } from "link-lib";
import React from "react";

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
export function useDataInvalidation(subjects: LaxIdentifier | LaxIdentifier[]): string {
    const lrs = useLRS();
    const invalidations = () => normalizeType(subjects).filter<Node>(Boolean as any).map((n) => n.value);
    const calculateString = () => JSON.stringify(invalidations().map((id) => lrs.getState(id).lastUpdate));

    const [, setValue] = React.useState(calculateString);
    const ids = normalizeType(subjects).filter<Node>(Boolean as any).map((n) => n.value);
    const idsDep = JSON.stringify(ids);

    React.useEffect(() => {
        return lrs.subscribe({
            callback: () => setValue(calculateString()),
            lastUpdateAt: undefined,
            markedForDelete: false,
            subjectFilter: ids,
        });
    }, [
        lrs,
        idsDep,
    ]);

    return calculateString();
}
