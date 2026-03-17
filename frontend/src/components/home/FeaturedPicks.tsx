"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type Product = { id: number; name: string; slug: string; price: string | number; images?: { url: string }[] };

const PICKS = [
  { tag: "Editor's Pick", tagGrad: "linear-gradient(135deg, #8b5cf6, #6366f1)", gradient: "linear-gradient(135deg, #1e1b4b, #4c1d95)", shadow: "0 12px 40px rgba(139,92,246,0.25)" },
  { tag: "Trending", tagGrad: "linear-gradient(135deg, #ec4899, #d946ef)", gradient: "linear-gradient(135deg, #500724, #831843)", shadow: "0 8px 24px rgba(236,72,153,0.25)" },
  { tag: "Sale", tagGrad: "linear-gradient(135deg, #ef4444, #f97316)", gradient: "linear-gradient(135deg, #450a0a, #7f1d1d)", shadow: "0 8px 24px rgba(239,68,68,0.25)" },
  { tag: "New", tagGrad: "linear-gradient(135deg, #06b6d4, #0891b2)", gradient: "linear-gradient(135deg, #042f2e, #164e63)", shadow: "0 8px 24px rgba(6,182,212,0.25)" },
];

export default function FeaturedPicks({ products, title }: { products: Product[]; title: string }) {
  const { ref, visible } = useScrollReveal();
  if (products.length < 4) return null;

  return (
    <section ref={ref} className="mb-12 sm:mb-16" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 700ms ease" }}>
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #8b5cf6, #d946ef)" }} />
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" style={{ gridTemplateRows: "200px 200px" }}>
        {products.slice(0, 4).map((product, i) => {
          const pick = PICKS[i];
          const img = product.images?.[0]?.url || "https://via.placeholder.com/400";
          const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;
          const isMain = i === 0;

          return (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className={`group relative overflow-hidden flex flex-col justify-end p-4 sm:p-5 ${isMain ? "row-span-2 col-span-2 sm:col-span-2" : ""}`}
              style={{
                borderRadius: 16, background: pick.gradient, transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transitionDelay: `${i * 100}ms`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = pick.shadow; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Image src={img} alt={product.name} fill className="object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" sizes={isMain ? "50vw" : "25vw"} />
              <div className="relative z-10">
                <span className="inline-block text-white text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full mb-2" style={{ background: pick.tagGrad }}>{pick.tag}</span>
                <h3 className={`font-bold text-white leading-tight ${isMain ? "text-lg sm:text-2xl mb-2" : "text-sm sm:text-base mb-1"} line-clamp-2`}>{product.name}</h3>
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-white/90 ${isMain ? "text-xl sm:text-2xl" : "text-base"}`}>${price}</span>
                  <ArrowRight size={16} className="text-white/0 group-hover:text-white/80 transition-all duration-300 group-hover:translate-x-0 -translate-x-2" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
