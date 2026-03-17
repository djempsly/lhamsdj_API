"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { CARD_COLORS } from "./cardColors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
type Product = { id: number; name: string; slug: string; price: string | number; images?: { id: number; url: string }[] };

export default function RecentlyViewed() {
  const t = useTranslations("home");
  const { ref, visible } = useScrollReveal();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { apiFetch } = await import("@/lib/apiFetch");
        const res = await apiFetch(`${API_URL}/search/recently-viewed`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setProducts(json.data);
      } catch { /* Not logged in */ }
    })();
  }, []);

  if (products.length === 0) return null;

  function scroll(dir: "left" | "right") { scrollRef.current?.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" }); }

  return (
    <section ref={ref} className="mb-12 sm:mb-16" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 700ms ease" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Clock size={20} className="text-gray-600" /></div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #6b7280, #9ca3af)" }} />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t("recentlyViewed")}</h2>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => scroll("left")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"><ChevronLeft size={18} /></button>
          <button onClick={() => scroll("right")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"><ChevronRight size={18} /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-3 px-3 pb-4">
        {products.map((product, i) => {
          const img = product.images?.[0]?.url || "https://via.placeholder.com/200";
          const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;
          const c = CARD_COLORS[i % CARD_COLORS.length];
          return (
            <Link key={product.id} href={`/product/${product.slug}`}
              className="group flex-shrink-0 w-[160px] sm:w-[190px] snap-start bg-white overflow-hidden"
              style={{ borderRadius: 16, borderBottom: `2.5px solid ${c.border}`, transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = c.shadow; e.currentTarget.style.transform = "translateY(-8px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div className="relative aspect-square bg-gray-100">
                <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="190px" />
                <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300"><Heart size={13} className="text-gray-500" /></button>
              </div>
              <div className="p-2.5">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                <span className="text-sm font-bold text-gray-900">${price}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
