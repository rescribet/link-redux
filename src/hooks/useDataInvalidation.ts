import * as React from "react";

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

    let result;
    if (props.dataSubjects) {
        result = Array.isArray(props.dataSubjects)
            ? [props.subject, ...props.dataSubjects]
            : [props.subject, props.dataSubjects];
    } else {
        result = [props.subject];
    }

    if (props.subject && props.subject.termType === "NamedNode") {
        const doc = props.subject.doc();
        if (doc !== props.subject) {
            result.push(doc);
        }
    }

    return result;
}

export function useDataInvalidation(props: DataInvalidationProps) {
    const lrs = useLRS();
    const [lastUpdate, setInvalidate] = React.useState<number>(
        (lrs as any).store.changeTimestamps[props.subject.sI],
    );

    function handleStatusChange(_: unknown, lastUpdateAt?: number) {
        setInvalidate(lastUpdateAt!);
    }

    const subscriptionSubjects = normalizeDataSubjects(props);
    React.useEffect(() => lrs.subscribe({
        callback: handleStatusChange,
        lastUpdateAt: undefined,
        markedForDelete: false,
        onlySubjects: true,
        subjectFilter: subscriptionSubjects,
    }), subscriptionSubjects);

    return lastUpdate;
}
