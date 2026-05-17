'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function InfiniteScrollTrigger({
  hasMore,
  isLoading,
  onLoadMore,
}: InfiniteScrollTriggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoading) {
          onLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (!hasMore) return null;

  return (
    <section ref={ref} className="flex justify-center py-8">
      {isLoading ? (
        <span className="text-sm text-slate-500">Loading more products…</span>
      ) : (
        <span className="h-8" aria-hidden />
      )}
    </section>
  );
}
