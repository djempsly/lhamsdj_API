"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type FlashSale = {
  id: number;
  name: string;
  discount: number;
  endsAt: string;
  items: {
    id: number;
    product: {
      id: number;
      name: string;
      slug?: string;
      price?: string | number;
      images?: { url: string }[];
    };
  }[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function Countdown({ endsAt }: { endsAt: string }) {
  const t = useTranslations("home");
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function calc() {
      const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs sm:text-sm text-red-200 font-medium">{t("flashSalesEnd")}</span>
      {[
        { val: pad(time.h), label: t("hours") },
        { val: pad(time.m), label: t("minutes") },
        { val: pad(time.s), label: t("seconds") },
      ].map(({ val, label }, i) => (
        <span key={i} className="flex items-center gap-0.5">
          {i > 0 && <span className="text-red-300 font-bold mx-0.5">:</span>}
          <span className="bg-white/20 backdrop-blur-sm text-white font-bold text-sm sm:text-base px-2 py-1 rounded-lg min-w-[32px] text-center">
            {val}
          </span>
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
      .then((r) => r.json())
      .then((j) => { setSales(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="mb-12 sm:mb-16">
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 animate-pulse">
          <div className="h-8 bg-white/20 rounded w-48 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl h-48" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (sales.length === 0) return null;

  const sale = sales[0];
  const products = sale.items.slice(0, 6);

  return (
    <section
      ref={ref}
      className="mb-12 sm:mb-16 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
    >
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap size={22} className="text-yellow-300 fill-yellow-300" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">{t("flashSales")}</h2>
            </div>
            <Countdown endsAt={sale.endsAt} />
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {products.map(({ product }, i) => {
              const img = product.images?.[0]?.url || "https://via.placeholder.com/200";
              const price = typeof product.price === "number" ? product.price.toFixed(2) : product.price;
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug || product.id}`}
                  className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(20px)",
                    transitionDelay: `${300 + i * 80}ms`,
                  }}
                >
                  <div className="relative aspect-square bg-gray-100">
                    <Image src={img} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 16vw" />
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                      -{sale.discount}% {t("off")}
                    </div>
                  </div>
                  <div className="p-2.5 sm:p-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{product.name}</h3>
                    {price && <span className="text-sm sm:text-base font-bold text-red-600">${price}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
