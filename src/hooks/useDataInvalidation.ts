import { useEffect, useState } from "react";

import { DataInvalidationProps, LinkReduxLRSType, SubjectType } from "../types";

/**
 * The subjects this component subscribes to.
 * Includes the subject by default.
 */
export function normalizeDataSubjects(props: DataInvalidationProps): SubjectType[] {
    if (!(props.subject || props.dataSubjects)) {
        return [];
    }

    if (props.dataSubjects) {
        return Array.isArray(props.dataSubjects)
            ? [props.subject, ...props.dataSubjects]
            : [props.subject, props.dataSubjects];
    }

    return [props.subject];
}

export function useDataInvalidation(props: DataInvalidationProps, lrs: LinkReduxLRSType) {
    const [lastUpdate, setInvalidate] = useState<number>(0);

    function handleStatusChange(_: unknown, lastUpdateAt?: number) {
        setInvalidate(lastUpdateAt!);
    }

    const subscriptionSubjects = normalizeDataSubjects(props);
    useEffect(() => lrs.subscribe({
        callback: handleStatusChange,
        markedForDelete: false,
        onlySubjects: true,
        subjectFilter: subscriptionSubjects,
    }), subscriptionSubjects);

    return lastUpdate;
}
