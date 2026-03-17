"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, Heart } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CARD_COLORS, BADGE_GRADIENTS } from "./cardColors";

type Product = { id: number; name: string; slug: string; price: string | number; description?: string | null; images?: { url: string }[] };
type Props = { products: Product[]; title: string; viewMore: string; viewAllHref?: string; viewAllLabel?: string };
const ITEMS_PER_PAGE = 4;

export default function NewArrivalsScroll({ products, title, viewMore, viewAllHref = "/products", viewAllLabel }: Props) {
  const { ref, visible } = useScrollReveal();
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (totalPages <= 1) return;
    const t = setInterval(() => { setFading(true); setTimeout(() => { setPage(p => (p + 1) % totalPages); setFading(false); }, 400); }, 5000);
    return () => clearInterval(t);
  }, [totalPages]);

  if (products.length === 0) return null;
  const currentProducts = products.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  function goTo(dir: "prev" | "next") { setFading(true); setTimeout(() => { setPage(p => dir === "next" ? (p + 1) % totalPages : (p === 0 ? totalPages - 1 : p - 1)); setFading(false); }, 400); }

  return (
    <section ref={ref} className="mb-12 sm:mb-16" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 700ms ease" }}>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Sparkles size={20} className="text-emerald-600" /></div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalPages > 1 && <div className="hidden sm:flex items-center gap-2 mr-2">
            <button onClick={() => goTo("prev")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"><ChevronLeft size={18} /></button>
            <button onClick={() => goTo("next")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"><ChevronRight size={18} /></button>
          </div>}
          {viewAllLabel && <Link href={viewAllHref} className="text-xs sm:text-sm font-semibold px-4 py-1.5 hidden sm:inline-flex" style={{ borderRadius: 20, border: "1px solid rgba(34,197,94,0.3)", color: "#16a34a" }}>{viewAllLabel}</Link>}
        </div>
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-3 px-3 snap-x snap-mandatory flex gap-3 pb-4">
        {products.map((product, i) => <Card key={product.id} product={product} viewMore={viewMore} index={i} className="flex-shrink-0 w-[72%] max-w-[280px] snap-center" />)}
      </div>

      {/* Desktop: fade between pages */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5" style={{ opacity: fading ? 0 : 1, transition: "opacity 400ms ease" }}>
          {currentProducts.map((product, i) => <Card key={product.id} product={product} viewMore={viewMore} index={i} style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(10px)" : "translateY(0)", transition: "all 500ms ease", transitionDelay: `${i * 80}ms` }} />)}
        </div>
        {totalPages > 1 && <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => <button key={i} onClick={() => { setFading(true); setTimeout(() => { setPage(i); setFading(false); }, 400); }} className="rounded-full transition-all duration-300" style={{ height: 6, width: page === i ? 32 : 8, background: page === i ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#d1d5db" }} />)}
        </div>}
      </div>

      {viewAllLabel && <div className="text-center mt-8">
        <Link href={viewAllHref} className="inline-flex items-center justify-center text-white px-8 min-h-[48px] font-semibold hover:scale-105 active:scale-100 transition-all" style={{ borderRadius: 50, background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 4px 16px rgba(34,197,94,0.3)" }}>{viewAllLabel}</Link>
      </div>}
    </section>
  );
}

function Card({ product, viewMore, index, className = "", style }: { product: Product; viewMore: string; index: number; className?: string; style?: React.CSSProperties }) {
  const img = product.images?.[0]?.url || "https://via.placeholder.com/300";
  const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;
  const c = CARD_COLORS[index % CARD_COLORS.length];

  return (
    <Link href={`/product/${product.slug}`} className={`group block touch-manipulation ${className}`} style={style}>
      <div
        className="relative overflow-hidden bg-white"
        style={{ borderRadius: 16, borderBottom: `2.5px solid ${c.border}`, transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = c.shadow; e.currentTarget.style.transform = "translateY(-8px)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div className="relative aspect-[4/3] bg-gray-100">
          <Image src={img} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width:640px) 75vw, 25vw" />
          <span className="absolute top-2.5 left-2.5 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ background: BADGE_GRADIENTS.new }}>NEW</span>
          <button className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300"><Heart size={15} className="text-gray-500" /></button>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{product.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{product.description?.substring(0, 60)}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-bold text-gray-900">${price}</span>
            <span className="text-white text-[10px] font-bold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: c.btnGrad }}>Add</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
