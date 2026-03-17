"use client";

import { useEffect, useState, useRef } from "react";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ProductCard from "@/components/products/ProductCard";

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
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            colorIndex={i}
            variant="compact"
            className="flex-shrink-0 w-[160px] sm:w-[190px] snap-start"
          />
        ))}
      </div>
    </section>
  );
}
