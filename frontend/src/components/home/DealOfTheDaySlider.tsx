"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDealOfTheDay, type DealProduct } from "@/services/dealOfTheDayService";

export default function DealOfTheDaySlider() {
  const [products, setProducts] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    getDealOfTheDay().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % products.length), 4000);
    return () => clearInterval(t);
  }, [products.length]);

  if (loading || products.length === 0) return null;

  const prev = () => setIndex((i) => (i === 0 ? products.length - 1 : i - 1));
  const next = () => setIndex((i) => (i + 1) % products.length);

  return (
    <section className="mb-10 sm:mb-14 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
      <div className="flex items-center gap-3 mb-4 px-3 sm:px-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-amber-950">
          Oferta del día
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Ofertas del día</h2>
      </div>
      <div className="relative group">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-gray-900 shadow-xl border border-gray-200/50">
          <div
            className="flex transition-transform duration-600 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {products.map((product) => (
              <div key={product.id} className="min-w-full flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-[55%] aspect-[4/3] sm:aspect-auto sm:min-h-[300px] bg-gray-800">
                  <Image
                    src={product.image || "https://via.placeholder.com/600"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 55vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-gray-900/80 sm:to-gray-900/60" />
                </div>
                <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center relative z-10 bg-gray-900 sm:bg-transparent sm:absolute sm:right-0 sm:top-0 sm:bottom-0 sm:w-[45%] sm:flex sm:items-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base mb-5 line-clamp-2">
                    {product.description?.slice(0, 120) || "Oferta especial."}…
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-400">
                      ${typeof product.price === "number" ? product.price.toFixed(2) : product.price}
                    </span>
                    <Link
                      href={`/product/${product.slug}`}
                      className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 hover:scale-105 active:scale-100 transition-all shadow-lg"
                    >
                      Ver oferta
                      <ChevronRight size={18} className="sm:inline hidden" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {products.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 hover:scale-110 transition-all z-10"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Siguiente"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 hover:scale-110 transition-all z-10"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {products.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Ir a oferta ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    index === i ? "bg-emerald-400 w-8" : "bg-white/40 w-2 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
