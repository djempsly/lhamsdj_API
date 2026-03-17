"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, TrendingUp } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  images?: { url: string }[];
  _count?: { reviews: number };
};

export default function BestSellersCarousel({
  products,
  title,
  badge,
}: {
  products: Product[];
  title: string;
  badge: string;
}) {
  const { ref, visible } = useScrollReveal();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (products.length === 0) return null;

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("a")?.offsetWidth || 280;
    el.scrollBy({ left: dir === "right" ? cardWidth * 2 : -cardWidth * 2, behavior: "smooth" });
    setTimeout(updateScrollState, 400);
  }

  return (
    <section
      ref={ref}
      className="mb-12 sm:mb-16 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
    >
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-amber-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-3 px-3 pb-4"
      >
        {products.map((product, i) => {
          const img = product.images?.[0]?.url || "https://via.placeholder.com/300";
          const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;
          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group flex-shrink-0 w-[220px] sm:w-[260px] snap-start rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1.5 hover:border-gray-200 transition-all duration-300"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${200 + i * 60}ms`,
              }}
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image
                  src={img}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="260px"
                />
                <div className="absolute top-2.5 left-2.5 bg-amber-400 text-amber-950 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Star size={10} className="fill-current" />
                  {badge}
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-black">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                    ))}
                  </div>
                  {product._count?.reviews != null && (
                    <span className="text-[10px] text-gray-400">({product._count.reviews})</span>
                  )}
                </div>
                <span className="text-lg sm:text-xl font-bold text-gray-900 mt-2 block">${price}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
