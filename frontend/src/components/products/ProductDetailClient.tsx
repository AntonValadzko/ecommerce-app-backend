'use client';

import { useState } from 'react';
import { QuickViewModal } from './QuickViewModal';

interface ProductDetailClientProps {
  productId: number;
}

export function ProductDetailClient({ productId }: ProductDetailClientProps) {
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <section className="mt-8">
      <button type="button" className="btn-secondary" onClick={() => setShowQuickView(true)}>
        Quick view preview
      </button>
      {showQuickView && (
        <QuickViewModal productId={productId} onClose={() => setShowQuickView(false)} />
      )}
    </section>
  );
}
