'use client';

import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useDebounce } from '@/hooks/use-debounce';
import type { AutocompleteSuggestion, CatalogQuery } from '@/lib/types';
import { cn } from '@/lib/cn';

interface SearchBarProps {
  query: CatalogQuery;
  onSearch: (q: string) => void;
  onSelectSuggestion: (suggestion: AutocompleteSuggestion) => void;
}

export function SearchBar({ query, onSearch, onSelectSuggestion }: SearchBarProps) {
  const [input, setInput] = useState(query.q ?? '');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounced = useDebounce(input, 250);

  useEffect(() => {
    setInput(query.q ?? '');
  }, [query.q]);

  const { data } = useSWR(
    debounced.length >= 2 ? ['autocomplete', debounced] : null,
    () => api.autocomplete(debounced)
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const suggestions = data?.data ?? [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(input.trim());
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name, description, SKU, or brand…"
          className="input pl-10 pr-24"
          aria-label="Search products"
          autoComplete="off"
        />
        <button type="submit" className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5">
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-surface-border bg-white py-1 shadow-modal"
          role="listbox"
        >
          {suggestions.map((s, i) => (
            <li key={`${s.type}-${s.id}-${i}`} role="option">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-brand-50"
                onClick={() => {
                  onSelectSuggestion(s);
                  setOpen(false);
                }}
              >
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-xs font-medium uppercase',
                    s.type === 'product' && 'bg-blue-100 text-blue-700',
                    s.type === 'brand' && 'bg-purple-100 text-purple-700',
                    s.type === 'category' && 'bg-green-100 text-green-700'
                  )}
                >
                  {s.type}
                </span>
                <span className="flex-1 truncate">{s.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}
