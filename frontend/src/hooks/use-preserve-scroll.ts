'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Snapshots window scroll before URL updates and restores it after React re-renders.
 * Restores again when async data finishes loading (layout height may change).
 */
export function usePreserveScroll(dependencyKey: string, isSettled = true) {
  const pendingY = useRef<number | null>(null);

  const capture = () => {
    pendingY.current = window.scrollY;
  };

  const tryRestore = () => {
    if (pendingY.current === null) return;

    const target = pendingY.current;
    const apply = () => {
      const maxY = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      window.scrollTo({ top: Math.min(target, maxY), left: 0, behavior: 'instant' });
    };

    apply();
    requestAnimationFrame(apply);

    if (isSettled) {
      pendingY.current = null;
    }
  };

  useLayoutEffect(() => {
    tryRestore();
  }, [dependencyKey, isSettled]);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    return () => {
      history.scrollRestoration = 'auto';
    };
  }, []);

  return { captureScroll: capture };
}
