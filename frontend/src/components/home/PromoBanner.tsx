"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function PromoBanner() {
  const t = useTranslations("home");
  const { ref, visible } = useScrollReveal();

  return (
    <section
      ref={ref}
      className="mb-12 sm:mb-16 transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}
    >
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl min-h-[260px] sm:min-h-[320px] flex items-center">
        {/* Gradient background with animated shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.15),transparent_50%)]" />

        {/* Floating shapes */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        {/* Content */}
        <div className="relative z-10 px-6 sm:px-10 md:px-16 py-10 sm:py-14 max-w-2xl">
          <div
            className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-xs font-medium mb-5"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-20px)", transitionDelay: "200ms", transition: "all 0.6s ease" }}
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse" />
            {t("trustedBy")}
          </div>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transitionDelay: "350ms", transition: "all 0.7s ease" }}
          >
            {t("promoTitle")}
          </h2>
          <p
            className="text-sm sm:text-base md:text-lg text-gray-300 mb-8 max-w-lg"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transitionDelay: "500ms", transition: "all 0.7s ease" }}
          >
            {t("promoSubtitle")}
          </p>
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3.5 rounded-full font-bold text-sm sm:text-base hover:bg-gray-100 hover:gap-3 hover:shadow-2xl active:scale-95 transition-all duration-300 touch-manipulation"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transitionDelay: "650ms", transition: "all 0.7s ease" }}
          >
            {t("promoButton")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
