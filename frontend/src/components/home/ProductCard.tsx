"use client";

import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    description?: string | null;
    images?: { url: string }[];
  };
  viewMore: string;
  /** Si true, card más grande (para bento destacado) */
  featured?: boolean;
};

export default function ProductCard({ product, viewMore, featured }: ProductCardProps) {
  const img = product.images?.[0]?.url || "https://via.placeholder.com/300";
  const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block touch-manipulation"
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm
          transition-all duration-300 ease-out
          hover:shadow-xl hover:-translate-y-1.5 hover:border-gray-200
          hover-shine
          ${featured ? "sm:min-h-[340px]" : ""}
        `}
      >
        <div
          className={`relative bg-gray-100 ${featured ? "aspect-[4/3] sm:aspect-[3/4] sm:min-h-[280px]" : "aspect-[4/3] sm:h-64"}`}
        >
          <Image
            src={img}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
          />
        </div>
        <div className={`p-3 sm:p-4 ${featured ? "sm:p-5" : ""}`}>
          <h3 className={`font-semibold text-gray-900 truncate group-hover:text-black ${featured ? "text-lg sm:text-xl" : "text-sm sm:text-base"}`}>
            {product.name}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm mb-2 line-clamp-2 mt-0.5">
            {product.description?.substring(0, 60) || ""}…
          </p>
          <div className="flex justify-between items-center">
            <span className={`font-bold text-gray-900 ${featured ? "text-xl sm:text-2xl" : "text-lg sm:text-xl"}`}>
              ${price}
            </span>
            <span className="text-blue-600 text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {viewMore}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
