"use client";

import * as React from "react";

/**
 * Returns a debounced version of the passed value that only updates after delayMs
 * has elapsed without changes.
 *
 * State is updated strictly inside the setTimeout callback (asynchronously),
 * avoiding cascading renders and satisfying react-hooks/set-state-in-effect.
 */
export function useDebouncedValue<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

