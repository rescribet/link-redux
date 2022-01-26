import React from "react";

/** Useful for using as a hook update dependency. */
export function useMemoizedDataSubjects<T, K extends T | T[] | undefined>(subjects: K): K {
  const [memoized, setMemoized] = React.useState(subjects);

  React.useEffect(() => {
    const aIsArray = Array.isArray(memoized);
    const bIsArray = Array.isArray(subjects);

    if (aIsArray && bIsArray) {
      if (memoized.length !== subjects.length || memoized.some((v, i) => v !== subjects[i])) {
        setMemoized(subjects);
      }
    } else if (aIsArray !== bIsArray) {
        setMemoized(subjects);
    } else if (memoized !== subjects) {
      setMemoized(subjects);
    }
  }, [subjects]);

  return memoized;
}
