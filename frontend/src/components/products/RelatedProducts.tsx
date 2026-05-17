'use client';

import { useState } from 'react';
import type { ProductListItem } from '@/lib/types';
import { ProductGrid } from './ProductGrid';
import { QuickViewModal } from './QuickViewModal';

interface RelatedProductsProps {
  products: ProductListItem[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const [quickViewId, setQuickViewId] = useState<number | null>(null);

  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-xl font-bold text-slate-900">Related products</h2>
      <ProductGrid products={products} onQuickView={setQuickViewId} />
      {quickViewId !== null && (
        <QuickViewModal productId={quickViewId} onClose={() => setQuickViewId(null)} />
      )}
    </section>
  );
}
