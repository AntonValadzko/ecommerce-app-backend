import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
            M
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            MarketPlace
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          <Link href="/" className="hover:text-brand-600">
            Catalog
          </Link>
          <a
            href="http://localhost:3000/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-600"
          >
            API Docs
          </a>
        </nav>
      </div>
    </header>
  );
}
