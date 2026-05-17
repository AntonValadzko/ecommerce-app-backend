import type { ProductListItem } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ProductListItem[];
  onQuickView: (id: number) => void;
  isLoading?: boolean;
}

export function ProductGrid({ products, onQuickView, isLoading }: ProductGridProps) {
  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (!isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-lg font-medium text-slate-700">No products found</p>
        <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
      ))}
    </div>
  );
}
