"use client";

import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { BADGE_GRADIENTS } from "@/components/shared/cardColors";
import ProductCard from "@/components/products/ProductCard";

type FlashSale = {
  id: number; name: string; discount: number; endsAt: string;
  items: { id: number; product: { id: number; name: string; slug?: string; price?: string | number; images?: { url: string }[] } }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function Countdown({ endsAt }: { endsAt: string }) {
  const t = useTranslations("home");
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    function calc() { const diff = Math.max(0, new Date(endsAt).getTime() - Date.now()); setTime({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) }); }
    calc(); const id = setInterval(calc, 1000); return () => clearInterval(id);
  }, [endsAt]);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs sm:text-sm text-red-200 font-medium">{t("flashSalesEnd")}</span>
      {[{ val: pad(time.h), label: t("hours") }, { val: pad(time.m), label: t("minutes") }, { val: pad(time.s), label: t("seconds") }].map(({ val, label }, i) => (
        <span key={i} className="flex items-center gap-0.5">
          {i > 0 && <span className="text-red-300 font-bold mx-0.5">:</span>}
          <span className="font-bold text-sm sm:text-base text-white px-2 py-1 min-w-[32px] text-center" style={{ background: "linear-gradient(135deg, #1a1a2e, #302b63)", borderRadius: 6 }}>{val}</span>
          <span className="text-[10px] text-red-200 uppercase">{label}</span>
        </span>
      ))}
    </div>
  );
}

export default function FlashSalesBanner() {
  const t = useTranslations("home");
  const { ref, visible } = useScrollReveal();
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/marketplace/flash-sales`, { cache: "no-store" })
      .then((r) => r.json()).then((j) => { setSales(j.data || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <section className="mb-12 sm:mb-16">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 p-6 sm:p-8 animate-pulse" style={{ borderRadius: 20 }}>
        <div className="h-8 bg-white/20 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="bg-white/10 rounded-xl h-48" />)}</div>
      </div>
    </section>
  );

  if (sales.length === 0) return null;
  const sale = sales[0];
  const products = sale.items.slice(0, 6);

  return (
    <section ref={ref} className="mb-12 sm:mb-16" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 700ms ease" }}>
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-5 sm:p-8 relative overflow-hidden" style={{ borderRadius: 20, border: "1px solid rgba(239,68,68,0.2)" }}>
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 -translate-y-1/2 translate-x-1/4 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 translate-y-1/2 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)" }} />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: BADGE_GRADIENTS.discount, animation: "pulse-glow 2s ease-in-out infinite" }}>
                <Zap size={22} className="text-white fill-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #ef4444, #f97316)" }} />
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">{t("flashSales")}</h2>
              </div>
            </div>
            <Countdown endsAt={sale.endsAt} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {products.map(({ product }, i) => (
              <ProductCard
                key={product.id}
                product={{ ...product, price: product.price ?? "0" }}
                colorIndex={i}
                variant="compact"
                badge="discount"
                badgeLabel={`-${sale.discount}% ${t("off")}`}
                discountPercent={sale.discount}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                  transitionDelay: `${300 + i * 80}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`@keyframes pulse-glow { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
    </section>
  );
}
