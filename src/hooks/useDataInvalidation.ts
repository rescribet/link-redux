import * as React from "react";

import { DataInvalidationProps, LinkContext, SubjectType } from "../types";

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

    return result;
}

export function useDataInvalidation(props: DataInvalidationProps, context: LinkContext) {
    const [lastUpdate, setInvalidate] = React.useState<number>(
        (context.lrs as any).store.changeTimestamps[props.subject.sI],
    );

    function handleStatusChange(_: unknown, lastUpdateAt?: number) {
        setInvalidate(lastUpdateAt!);
    }

    const subscriptionSubjects = normalizeDataSubjects(props);
    React.useEffect(() => context.lrs.subscribe({
        callback: handleStatusChange,
        lastUpdateAt: undefined,
        markedForDelete: false,
        onlySubjects: true,
        subjectFilter: subscriptionSubjects,
    }), subscriptionSubjects);

    return lastUpdate;
}
