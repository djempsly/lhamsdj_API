"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ProductCard from "@/components/products/ProductCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Product = {
  id: number; name: string; slug: string; price: string | number;
  images?: { url: string }[]; _count?: { reviews: number };
  category?: { name: string };
};

export default function RelatedProducts({ productId }: { productId: number }) {
  const t = useTranslations("productPage");
  const { ref, visible } = useScrollReveal();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/search/recommendations/${productId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => { if (j.success && Array.isArray(j.data)) setProducts(j.data); })
      .catch(() => {});
  }, [productId]);

  if (products.length === 0) return null;

  function scroll(dir: "left" | "right") { scrollRef.current?.scrollBy({ left: dir === "right" ? 400 : -400, behavior: "smooth" }); }

  return (
    <section ref={ref} className="mb-8" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 700ms ease" }}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{t("relatedTitle")}</h2>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => scroll("left")} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"><ChevronLeft size={16} /></button>
          <button onClick={() => scroll("right")} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-3 px-3 pb-4">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            colorIndex={i}
            showStars
            showShipping
            className="flex-shrink-0 w-[200px] sm:w-[240px] snap-start"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(15px)",
              transition: "all 500ms ease",
              transitionDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
