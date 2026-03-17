"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useRef } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Product = {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  images?: { id: number; url: string }[];
};

export default function RecentlyViewed() {
  const t = useTranslations("home");
  const { ref, visible } = useScrollReveal();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const { apiFetch } = await import("@/lib/apiFetch");
        const res = await apiFetch(`${API_URL}/search/recently-viewed`, { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      } catch {
        // Not logged in or no history
      }
    }
    load();
  }, []);

  if (products.length === 0) return null;

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  }

  return (
    <section
      ref={ref}
      className="mb-12 sm:mb-16 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
            <Clock size={20} className="text-gray-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t("recentlyViewed")}</h2>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => scroll("left")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll("right")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-3 px-3 pb-4">
        {products.map((product, i) => {
          const img = product.images?.[0]?.url || "https://via.placeholder.com/200";
          const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;
          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group flex-shrink-0 w-[160px] sm:w-[190px] snap-start rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div className="relative aspect-square bg-gray-100">
                <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="190px" />
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
