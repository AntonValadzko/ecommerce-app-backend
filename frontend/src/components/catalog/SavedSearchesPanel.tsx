'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import type { SavedSearch } from '@/lib/types';
import { catalogParamsToUrl } from '@/lib/catalog-params';
import { summarizeQuery } from '@/lib/query-summary';
import { useRouter } from 'next/navigation';

interface SavedSearchesPanelProps {
  open: boolean;
  onClose: () => void;
}

export function SavedSearchesPanel({ open, onClose }: SavedSearchesPanelProps) {
  const router = useRouter();
  const { data, mutate } = useSWR(open ? 'saved-searches' : null, () => api.getSavedSearches());

  if (!open) return null;

  async function handleDelete(id: string) {
    await api.deleteSavedSearch(id);
    mutate();
  }

  function applySearch(search: SavedSearch) {
    router.replace(catalogParamsToUrl(search.query), { scroll: false });
    onClose();
  }

  const searches = data?.data ?? [];

  return (
    <section className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close panel"
      />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-modal">
        <header className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h2 className="text-lg font-semibold">Saved searches</h2>
          <button type="button" onClick={onClose} className="btn-ghost px-2">
            ✕
          </button>
        </header>

        <p className="border-b border-surface-border px-5 py-3 text-sm text-slate-500">
          Use &ldquo;Save this search&rdquo; on the catalog page to add new saved searches.
        </p>

        <ul className="flex-1 overflow-y-auto p-5">
          {searches.length === 0 ? (
            <p className="text-center text-sm text-slate-500">No saved searches yet</p>
          ) : (
            searches.map((s) => (
              <li
                key={s.id}
                className="mb-3 rounded-lg border border-surface-border p-3 last:mb-0"
              >
                <button
                  type="button"
                  onClick={() => applySearch(s)}
                  className="w-full text-left font-medium text-slate-900 hover:text-brand-600"
                >
                  {s.name}
                </button>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {summarizeQuery(s.query)}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="mt-2 text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </aside>
    </section>
  );
}
