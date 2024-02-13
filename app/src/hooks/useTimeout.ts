import { useCallback, useEffect, useRef } from "react";

export const useTimeout = (delayMs: number, onTimerEnd: () => void) => {
  const savedCallback = useRef(onTimerEnd);
  const handle = useRef<NodeJS.Timeout | null>(null);

  // Handle changing callback fxn
  useEffect(() => {
    savedCallback.current = onTimerEnd;
  }, [onTimerEnd]);

  // allow reseting the timer
  const reset = useCallback(() => {
    if (handle.current) {
      clearTimeout(handle.current);
    }

    if (delayMs <= 0) {
      return;
    }

    handle.current = setTimeout(() => {
      savedCallback.current();
    }, delayMs);
  }, []);

  // Initialize and cleanup
  useEffect(() => {
    if (handle.current) {
      clearTimeout(handle.current);
    }

    if (delayMs <= 0) {
      return;
    }

    handle.current = setTimeout(() => {
      savedCallback.current();
    }, delayMs);

    return () => {
      if (handle.current) {
        clearTimeout(handle.current);
      }
    };
  }, [delayMs]);

  return { reset };
};
