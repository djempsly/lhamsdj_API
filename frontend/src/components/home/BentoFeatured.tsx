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

type BentoFeaturedProps = {
  products: Product[];
  title: string;
  viewMore: string;
};

export default function BentoFeatured({ products, title, viewMore }: BentoFeaturedProps) {
  if (products.length === 0) return null;

  const [first, ...rest] = products;
  const showRest = rest.slice(0, 3);

  return (
    <section className="mb-10 sm:mb-14">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 px-0.5">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="sm:col-span-2 lg:row-span-2 lg:col-span-1">
          <ProductCard product={first} viewMore={viewMore} featured />
        </div>
        {showRest.map((product) => (
          <div key={product.id} className="hidden sm:block">
            <ProductCard product={product} viewMore={viewMore} />
          </div>
        ))}
        {/* En móvil: mostrar solo el destacado; debajo un scroll horizontal con el resto */}
        <div className="sm:hidden col-span-1 overflow-x-auto scrollbar-hide -mx-3 px-3 flex gap-4 pb-2">
          {showRest.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[72%] max-w-[280px]">
              <ProductCard product={product} viewMore={viewMore} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
