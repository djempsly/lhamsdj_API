"use client";

import { useState } from "react";
import { Mail, ArrowRight, Check, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { apiFetch } from "@/lib/apiFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function NewsletterSection() {
  const t = useTranslations("home");
  const { ref, visible } = useScrollReveal();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!email) return; setStatus("loading");
    try { const res = await apiFetch(`${API_URL}/marketplace/newsletter/subscribe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); setStatus(res.ok ? "success" : "error"); if (res.ok) setEmail(""); } catch { setStatus("error"); }
  }

  return (
    <section ref={ref} className="mb-12 sm:mb-16" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 700ms ease" }}>
      <div className="relative overflow-hidden p-6 sm:p-10 md:p-14" style={{ borderRadius: 20, background: "linear-gradient(135deg, #4f46e5, #7c3aed, #c026d3)", border: "1px solid rgba(139,92,246,0.15)" }}>
        {/* Glow orb behind title */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 60%)" }} />
        <div className="absolute top-0 right-0 w-64 h-64 -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.03)" }} />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 translate-y-1/2 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.03)" }} />
        <div className="absolute top-1/2 right-1/4 hidden lg:block"><Sparkles size={80} className="text-white/5" /></div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <Mail size={26} className="text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight">{t("newsletterTitle")}</h2>
          <p className="text-sm sm:text-base text-white/80 mb-8 max-w-lg mx-auto">{t("newsletterSubtitle")}</p>

          {status === "success" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center"><Check size={28} className="text-white" /></div>
              <p className="text-white font-bold text-lg">{t("newsletterSuccess")}</p>
              <p className="text-white/70 text-sm">{t("newsletterSuccessDesc")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t("newsletterPlaceholder")} required className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:ring-2 focus:ring-white/50 outline-none shadow-lg" />
              </div>
              <button type="submit" disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 text-white px-6 py-3.5 font-bold text-sm sm:text-base hover:gap-3 active:scale-95 transition-all duration-300 disabled:opacity-60 min-h-[48px] touch-manipulation whitespace-nowrap"
                style={{ borderRadius: 12, background: "linear-gradient(135deg, #8b5cf6, #d946ef)", boxShadow: "0 4px 16px rgba(139,92,246,0.3)" }}
              >{t("newsletterButton")}<ArrowRight size={18} /></button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
