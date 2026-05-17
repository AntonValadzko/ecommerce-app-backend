'use client';

import { useState } from 'react';
import { mutate } from 'swr';
import { api } from '@/lib/api';
import type { CatalogQuery, Category } from '@/lib/types';
import {
  buildActiveFilterChips,
  hasActiveFilters,
  toSavableQuery,
} from '@/lib/query-summary';
import { preventFocusScroll } from '@/lib/prevent-focus-scroll';

interface ActiveFiltersBarProps {
  query: CatalogQuery;
  categories: Category[];
  onChange: (patch: Partial<CatalogQuery>) => void;
  onClearAll: () => void;
  onOpenSavedSearches?: () => void;
}

export function ActiveFiltersBar({
  query,
  categories,
  onChange,
  onClearAll,
  onOpenSavedSearches,
}: ActiveFiltersBarProps) {
  const chips = buildActiveFilterChips(query, categories);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const showBar = hasActiveFilters(query) || saveOpen;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!saveName.trim()) return;
    setSaveStatus('saving');
    try {
      await api.saveSearch(saveName.trim(), toSavableQuery(query));
      setSaveName('');
      setSaveOpen(false);
      setSaveStatus('saved');
      mutate('saved-searches');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  }

  if (!showBar && saveStatus === 'idle') {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-surface-border bg-white/60 px-4 py-3">
        <p className="text-sm text-slate-500">No filters applied — browse all products or use the sidebar.</p>
        <button type="button" onClick={() => setSaveOpen(true)} className="btn-secondary text-sm">
          Save current view
        </button>
      </section>
    );
  }

  return (
    <section className="min-h-[4.5rem] rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-4 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <section className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
            Your selection
          </p>
          {chips.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Active filters">
              {chips.map((chip) => (
                <li key={chip.id}>
                  <FilterChip
                    label={chip.label}
                    onRemove={() => onChange(chip.clearPatch)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-600">Default catalog view (no filters)</p>
          )}
        </section>

        <section className="flex shrink-0 flex-wrap items-center gap-2">
          {chips.length > 0 && (
            <button type="button" onClick={onClearAll} className="btn-ghost text-sm">
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={() => setSaveOpen((v) => !v)}
            className="btn-primary text-sm"
          >
            {saveOpen ? 'Cancel' : 'Save this search'}
          </button>
          {onOpenSavedSearches && (
            <button type="button" onClick={onOpenSavedSearches} className="btn-secondary text-sm">
              My saved searches
            </button>
          )}
        </section>
      </div>

      {saveOpen && (
        <form
          onSubmit={handleSave}
          className="mt-4 flex flex-col gap-3 border-t border-brand-100 pt-4 sm:flex-row sm:items-end"
        >
          <label className="flex-1">
            <span className="mb-1 block text-sm font-medium text-slate-700">Name this search</span>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Electronics under $200, 4+ stars"
              className="input"
              maxLength={100}
              autoFocus
            />
          </label>
          <button
            type="submit"
            className="btn-primary sm:mb-0.5"
            disabled={!saveName.trim() || saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      {saveStatus === 'saved' && (
        <p className="mt-2 text-sm font-medium text-green-700" role="status">
          Search saved successfully.
        </p>
      )}
      {saveStatus === 'error' && (
        <p className="mt-2 text-sm font-medium text-red-600" role="alert">
          Could not save. Is the API running?
        </p>
      )}
    </section>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-white py-1 pl-3 pr-1 text-sm text-slate-800 shadow-sm">
      {label}
      <button
        type="button"
        onMouseDown={preventFocusScroll}
        onClick={onRemove}
        className="ml-0.5 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        aria-label={`Remove ${label}`}
      >
        <span aria-hidden>×</span>
      </button>
    </span>
  );
}
