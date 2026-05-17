'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ProductListItem } from '@/lib/types';
import { formatPrice, discountPercent } from '@/lib/format';
import { StarRating } from '@/components/ui/StarRating';
import { cn } from '@/lib/cn';

interface ProductCardProps {
  product: ProductListItem;
  onQuickView: (id: number) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const discount = discountPercent(product.price, product.compareAtPrice);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-surface-border bg-white shadow-card transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discount && (
          <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-medium text-white">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.brand}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-600">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-slate-400">{product.categoryName}</p>

        <div className="mt-2">
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.compareAtPrice && (
              <span className="ml-2 text-sm text-slate-400 line-through">
                {formatPrice(product.compareAtPrice, product.currency)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product.id);
            }}
            className={cn(
              'btn-secondary shrink-0 px-3 py-1.5 text-xs opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100'
            )}
          >
            Quick view
          </button>
        </div>
      </div>
    </article>
  );
}
