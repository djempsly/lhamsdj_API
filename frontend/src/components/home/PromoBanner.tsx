"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function PromoBanner() {
  const t = useTranslations("home");
  const { ref, visible } = useScrollReveal();

  return (
    <section ref={ref} className="mb-12 sm:mb-16" style={{ opacity: visible ? 1 : 0, transform: visible ? `translateY(0) scale(1)` : "translateY(30px) scale(0.98)", transition: "all 700ms ease" }}>
      <div
        className="relative overflow-hidden min-h-[260px] sm:min-h-[320px] flex items-center group"
        style={{ borderRadius: 20, background: "linear-gradient(135deg, #7c3aed, #c026d3, #f472b6)", transition: "all 500ms ease" }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(217,70,239,0.3)"; e.currentTarget.style.transform = "scale(1.01)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "scale(1)"; }}
      >
        {/* Orbital circles */}
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] -translate-y-1/2 rounded-full pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.1)" }} />
        <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] -translate-y-1/2 translate-x-[50px] rounded-full pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] -translate-y-1/2 -translate-x-[50px] rounded-full pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.05)" }} />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 -translate-y-1/3 translate-x-1/4 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)" }} />

        <div className="relative z-10 px-6 sm:px-10 md:px-16 py-10 sm:py-14 max-w-2xl">
          <div
            className="inline-flex items-center px-3 py-1 text-white/80 text-xs font-medium mb-5"
            style={{ borderRadius: 20, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-20px)", transitionDelay: "200ms", transition: "all 0.6s ease" }}
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse" />{t("trustedBy")}
          </div>
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transitionDelay: "350ms", transition: "all 0.7s ease" }}
          >{t("promoTitle")}</h2>
          <p
            className="text-sm sm:text-base md:text-lg text-white/80 mb-8 max-w-lg"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transitionDelay: "500ms", transition: "all 0.7s ease" }}
          >{t("promoSubtitle")}</p>
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 text-white px-8 py-3.5 font-bold text-sm sm:text-base hover:gap-3 active:scale-95 touch-manipulation"
            style={{
              borderRadius: 50, backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.15)",
              opacity: visible ? 1 : 0, transform: visible ? "translateX(0)" : "translateX(-30px)", transitionDelay: "650ms", transition: "all 0.7s ease",
            }}
          >
            {t("promoButton")}<ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
