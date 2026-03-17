"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ProductCard from "@/components/products/ProductCard";

type Product = { id: number; name: string; slug: string; price: string | number; images?: { url: string }[]; _count?: { reviews: number } };

export default function BestSellersCarousel({ products, title, badge }: { products: Product[]; title: string; badge: string }) {
  const { ref, visible } = useScrollReveal();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (products.length === 0) return null;

  function updateScrollState() {
    const el = scrollRef.current; if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }
  function scroll(dir: "left" | "right") {
    const el = scrollRef.current; if (!el) return;
    el.scrollBy({ left: dir === "right" ? 560 : -560, behavior: "smooth" });
    setTimeout(updateScrollState, 400);
  }

  return (
    <section ref={ref} className="mb-12 sm:mb-16" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 700ms ease" }}>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><TrendingUp size={20} className="text-amber-600" /></div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #f59e0b, #eab308)" }} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => scroll("left")} disabled={!canScrollLeft} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all disabled:opacity-30"><ChevronLeft size={20} /></button>
            <button onClick={() => scroll("right")} disabled={!canScrollRight} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all disabled:opacity-30"><ChevronRight size={20} /></button>
          </div>
          <Link href="/products?sort=sales" className="text-xs sm:text-sm font-semibold px-4 py-1.5 hidden sm:inline-flex" style={{ borderRadius: 20, border: "1px solid rgba(245,158,11,0.3)", color: "#d97706" }}>See all</Link>
        </div>
      </div>
      <div ref={scrollRef} onScroll={updateScrollState} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-3 px-3 pb-4">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            colorIndex={i}
            badge="bestSeller"
            badgeLabel={badge}
            showStars
            className="flex-shrink-0 w-[220px] sm:w-[260px] snap-start"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
              transitionDelay: `${200 + i * 60}ms`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
