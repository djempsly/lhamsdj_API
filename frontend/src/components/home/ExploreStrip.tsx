"use client";

import Link from "next/link";
import { Truck, RefreshCw, Shield, Sparkles, Headphones } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const items = [
  { icon: Truck, label: "Envío a todo el mundo", color: "bg-blue-50 text-blue-600", href: "/products" },
  { icon: RefreshCw, label: "Devoluciones fáciles", color: "bg-emerald-50 text-emerald-600", href: "/products" },
  { icon: Shield, label: "Pago 100% seguro", color: "bg-purple-50 text-purple-600", href: "/products" },
  { icon: Sparkles, label: "Ofertas cada día", color: "bg-amber-50 text-amber-600", href: "/deals" },
  { icon: Headphones, label: "Soporte 24/7", color: "bg-rose-50 text-rose-600", href: "/products" },
];

export default function ExploreStrip() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="py-8 sm:py-10 mb-10 sm:mb-14 border-y border-gray-100 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
    >
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-5 gap-3 sm:gap-4 -mx-3 px-3 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
          {items.map(({ icon: Icon, label, color, href }, i) => (
            <Link
              key={label}
              href={href}
              className="flex-shrink-0 w-[70%] sm:w-auto snap-center flex items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 group"
              style={{
                transitionDelay: `${i * 80}ms`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(15px)",
              }}
            >
              <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                <Icon size={20} />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 leading-tight">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
