import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <section className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
      <p className="mt-2 text-slate-500">The product you are looking for does not exist.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to catalog
      </Link>
    </section>
  );
}
