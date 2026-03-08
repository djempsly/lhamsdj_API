"use client";

import ProductCard from "./ProductCard";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  description?: string | null;
  images?: { url: string }[];
};

type NewArrivalsScrollProps = {
  products: Product[];
  title: string;
  viewMore: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export default function NewArrivalsScroll({
  products,
  title,
  viewMore,
  viewAllHref = "/products",
  viewAllLabel,
}: NewArrivalsScrollProps) {
  if (products.length === 0) return null;

  return (
    <section className="mb-10 sm:mb-14">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
        {viewAllLabel && (
          <a
            href={viewAllHref}
            className="text-sm font-semibold text-gray-600 hover:text-black transition-colors"
          >
            {viewAllLabel}
          </a>
        )}
      </div>
      {/* Móvil: scroll horizontal con snap */}
      <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-3 px-3 snap-x snap-mandatory flex gap-4 pb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[75%] max-w-[300px] snap-center"
          >
            <ProductCard product={product} viewMore={viewMore} />
          </div>
        ))}
      </div>
      {/* Desktop: grid clásico */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} viewMore={viewMore} />
        ))}
      </div>
      {viewAllLabel && (
        <div className="text-center mt-8">
          <a
            href={viewAllHref}
            className="inline-flex items-center justify-center bg-black text-white px-8 min-h-[48px] rounded-full font-semibold hover:bg-gray-800 hover:scale-105 active:scale-100 transition-all"
          >
            {viewAllLabel}
          </a>
        </div>
      )}
    </section>
  );
}
