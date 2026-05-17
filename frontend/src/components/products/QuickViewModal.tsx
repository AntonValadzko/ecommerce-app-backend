'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { formatPrice, discountPercent } from '@/lib/format';
import { StarRating } from '@/components/ui/StarRating';

interface QuickViewModalProps {
  productId: number | null;
  onClose: () => void;
}

export function QuickViewModal({ productId, onClose }: QuickViewModalProps) {
  const { data, isLoading } = useSWR(
    productId ? ['quick-view', productId] : null,
    () => api.getQuickView(productId!)
  );

  useEffect(() => {
    if (!productId) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [productId, onClose]);

  if (!productId) return null;

  const product = data?.data;
  const discount = product ? discountPercent(product.price, product.compareAtPrice) : null;

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Quick view"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <article className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-modal">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-slate-600 shadow hover:bg-white"
          aria-label="Close quick view"
        >
          ✕
        </button>

        {isLoading || !product ? (
          <section className="flex h-64 items-center justify-center">
            <span className="text-slate-500">Loading…</span>
          </section>
        ) : (
          <section className="grid gap-6 p-6 sm:grid-cols-2">
            <section className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
              <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              {discount && (
                <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                  -{discount}%
                </span>
              )}
            </section>
            <section>
              <p className="text-sm font-medium text-brand-600">{product.brand}</p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{product.name}</h2>
              <p className="mt-1 text-xs text-slate-400">SKU: {product.sku}</p>
              <section className="mt-3">
                <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
              </section>
              <section className="mt-4 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatPrice(product.price, product.currency)}</span>
                {product.compareAtPrice && (
                  <span className="text-slate-400 line-through">
                    {formatPrice(product.compareAtPrice, product.currency)}
                  </span>
                )}
              </section>
              <p
                className={`mt-2 text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}
              >
                {product.inStock ? 'In stock' : 'Out of stock'}
              </p>
              {product.attributes.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-slate-600">
                  {product.attributes.map((a) => (
                    <li key={`${a.name}-${a.value}`}>
                      <span className="capitalize text-slate-500">{a.name}:</span> {a.value}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/products/${product.slug}`}
                className="btn-primary mt-6 w-full"
                onClick={onClose}
              >
                View full details
              </Link>
            </section>
          </section>
        )}
      </article>
    </section>
  );
}
