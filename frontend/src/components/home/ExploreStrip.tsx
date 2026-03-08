"use client";

import Link from "next/link";
import { Truck, RefreshCw, Shield, Sparkles } from "lucide-react";

const items = [
  { icon: Truck, label: "Envío a todo el mundo", href: "/products" },
  { icon: RefreshCw, label: "Devoluciones fáciles", href: "/products" },
  { icon: Shield, label: "Pago seguro", href: "/products" },
  { icon: Sparkles, label: "Ofertas cada día", href: "/deals" },
];

export default function ExploreStrip() {
  return (
    <section className="py-8 sm:py-10 mb-8 sm:mb-12 bg-gradient-to-b from-gray-50 to-white border-y border-gray-100">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col sm:flex-row items-center gap-3 p-4 sm:p-5 rounded-2xl bg-white/80 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon size={22} />
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-700 group-hover:text-gray-900 text-center sm:text-left">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
