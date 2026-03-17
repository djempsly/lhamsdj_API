"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, TrendingUp, Heart } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CARD_COLORS, BADGE_GRADIENTS } from "./cardColors";

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
        {products.map((product, i) => {
          const img = product.images?.[0]?.url || "https://via.placeholder.com/300";
          const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;
          const c = CARD_COLORS[i % CARD_COLORS.length];
          return (
            <Link key={product.id} href={`/product/${product.slug}`}
              className="group flex-shrink-0 w-[220px] sm:w-[260px] snap-start bg-white overflow-hidden"
              style={{ borderRadius: 16, borderBottom: `2.5px solid ${c.border}`, transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transitionDelay: `${200 + i * 60}ms` }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = c.shadow; e.currentTarget.style.transform = "translateY(-8px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="260px" />
                <span className="absolute top-2.5 left-2.5 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: BADGE_GRADIENTS.bestSeller }}>
                  <Star size={10} className="fill-current" />{badge}
                </span>
                <button className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300"><Heart size={15} className="text-gray-500" /></button>
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />)}</div>
                  {product._count?.reviews != null && <span className="text-[10px] text-gray-400">({product._count.reviews})</span>}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg sm:text-xl font-bold text-gray-900">${price}</span>
                  <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: c.btnGrad }}>Add</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
