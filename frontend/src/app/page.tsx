import type { Metadata } from 'next';
import { CatalogPage } from '@/components/catalog/CatalogPage';

export const metadata: Metadata = {
  title: 'Product Catalog',
  description:
    'Browse products with advanced search, filters, sorting, and saved searches.',
};

export default function HomePage() {
  return <CatalogPage />;
}
