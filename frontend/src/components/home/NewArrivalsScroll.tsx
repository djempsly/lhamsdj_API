"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  description?: string | null;
  images?: { url: string }[];
};

type Props = {
  products: Product[];
  title: string;
  viewMore: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

const ITEMS_PER_PAGE = 4;

export default function NewArrivalsScroll({ products, title, viewMore, viewAllHref = "/products", viewAllLabel }: Props) {
  const { ref, visible } = useScrollReveal();
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (totalPages <= 1) return;
    const t = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setPage((p) => (p + 1) % totalPages);
        setFading(false);
      }, 400);
    }, 5000);
    return () => clearInterval(t);
  }, [totalPages]);

  if (products.length === 0) return null;

  const currentProducts = products.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  function goTo(dir: "prev" | "next") {
    setFading(true);
    setTimeout(() => {
      setPage((p) => dir === "next" ? (p + 1) % totalPages : (p === 0 ? totalPages - 1 : p - 1));
      setFading(false);
    }, 400);
  }

  return (
    <section
      ref={ref}
      className="mb-12 sm:mb-16 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
    >
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Sparkles size={20} className="text-emerald-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {totalPages > 1 && (
            <div className="hidden sm:flex items-center gap-2 mr-2">
              <button onClick={() => goTo("prev")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => goTo("next")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          {viewAllLabel && (
            <Link href={viewAllHref} className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">
              {viewAllLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-3 px-3 snap-x snap-mandatory flex gap-3 pb-4">
        {products.map((product) => (
          <Card key={product.id} product={product} viewMore={viewMore} className="flex-shrink-0 w-[72%] max-w-[280px] snap-center" />
        ))}
      </div>

      {/* Desktop: fade between pages of 4 */}
      <div className="hidden sm:block">
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 transition-opacity duration-400 ease-in-out"
          style={{ opacity: fading ? 0 : 1 }}
        >
          {currentProducts.map((product, i) => (
            <Card
              key={product.id}
              product={product}
              viewMore={viewMore}
              style={{
                transitionDelay: `${i * 80}ms`,
                opacity: fading ? 0 : 1,
                transform: fading ? "translateY(10px)" : "translateY(0)",
                transition: "all 0.5s ease",
              }}
            />
          ))}
        </div>

        {/* Page dots */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setFading(true); setTimeout(() => { setPage(i); setFading(false); }, 400); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${page === i ? "bg-gray-900 w-8" : "bg-gray-300 w-2 hover:bg-gray-400"}`}
              />
            ))}
          </div>
        )}
      </div>

      {viewAllLabel && (
        <div className="text-center mt-8">
          <Link
            href={viewAllHref}
            className="inline-flex items-center justify-center bg-black text-white px-8 min-h-[48px] rounded-full font-semibold hover:bg-gray-800 hover:scale-105 active:scale-100 transition-all"
          >
            {viewAllLabel}
          </Link>
        </div>
      )}
    </section>
  );
}

function Card({
  product,
  viewMore,
  className = "",
  style,
}: {
  product: Product;
  viewMore: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const img = product.images?.[0]?.url || "https://via.placeholder.com/300";
  const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;

  return (
    <Link href={`/product/${product.slug}`} className={`group block touch-manipulation ${className}`} style={style}>
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 hover:border-gray-200">
        <div className="relative aspect-[4/3] bg-gray-100">
          <Image src={img} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 75vw, 25vw" />
          <div className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            NEW
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-black">{product.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{product.description?.substring(0, 60)}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-bold text-gray-900">${price}</span>
            <span className="text-blue-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">{viewMore}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
