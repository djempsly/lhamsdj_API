"use client";

import Link from "next/link";
import { Truck, RefreshCw, Shield, Sparkles, Headphones } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const items = [
  { icon: Truck, label: "Envío a todo el mundo", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)", href: "/products" },
  { icon: RefreshCw, label: "Devoluciones fáciles", color: "#22c55e", bg: "rgba(34,197,94,0.08)", href: "/products" },
  { icon: Shield, label: "Pago 100% seguro", color: "#06b6d4", bg: "rgba(6,182,212,0.08)", href: "/products" },
  { icon: Sparkles, label: "Ofertas cada día", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", href: "/deals" },
  { icon: Headphones, label: "Soporte 24/7", color: "#ec4899", bg: "rgba(236,72,153,0.08)", href: "/products" },
];

export default function ExploreStrip() {
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref} className="py-8 sm:py-10 mb-10 sm:mb-14 border-y border-gray-100" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 700ms ease" }}>
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-5 gap-3 sm:gap-4 -mx-3 px-3 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
          {items.map(({ icon: Icon, label, color, bg, href }, i) => (
            <Link key={label} href={href}
              className="flex-shrink-0 w-[70%] sm:w-auto snap-center flex items-center gap-3 p-4 sm:p-5 bg-white border border-gray-100 group"
              style={{
                borderRadius: 16, transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(15px)", transitionDelay: `${i * 80}ms`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 8px 24px ${bg.replace("0.08", "0.2")}`; e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0" style={{ background: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
