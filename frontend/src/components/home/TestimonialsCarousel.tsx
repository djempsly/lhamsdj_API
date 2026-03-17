"use client";

import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Verified Buyer", avatar: "S", text: "Incredible quality and super fast shipping. This marketplace has become my go-to for everything!", rating: 5, color: "#8b5cf6", border: "rgba(139,92,246,0.2)", shadow: "0 8px 24px rgba(139,92,246,0.15)", avatarGrad: "linear-gradient(135deg, #8b5cf6, #6366f1)" },
  { name: "Carlos R.", role: "Verified Buyer", avatar: "C", text: "Amazing deals and the customer service is top notch. I've saved hundreds compared to other stores.", rating: 5, color: "#ec4899", border: "rgba(236,72,153,0.2)", shadow: "0 8px 24px rgba(236,72,153,0.15)", avatarGrad: "linear-gradient(135deg, #ec4899, #db2777)" },
  { name: "Marie L.", role: "Verified Buyer", avatar: "M", text: "The variety of products is unmatched. Found exactly what I needed at great prices. Highly recommend!", rating: 5, color: "#06b6d4", border: "rgba(6,182,212,0.2)", shadow: "0 8px 24px rgba(6,182,212,0.15)", avatarGrad: "linear-gradient(135deg, #06b6d4, #0891b2)" },
  { name: "James K.", role: "Verified Buyer", avatar: "J", text: "Best online shopping experience. Easy checkout, secure payments, and products always arrive on time.", rating: 4, color: "#f59e0b", border: "rgba(245,158,11,0.2)", shadow: "0 8px 24px rgba(245,158,11,0.15)", avatarGrad: "linear-gradient(135deg, #f59e0b, #d97706)" },
];

export default function TestimonialsCarousel() {
  const { ref, visible } = useScrollReveal();
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") { scrollRef.current?.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" }); }

  return (
    <section ref={ref} className="mb-12 sm:mb-16" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 700ms ease" }}>
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "linear-gradient(135deg, #ec4899, #d946ef)" }} />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">What Our Customers Say</h2>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button onClick={() => scroll("left")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"><ChevronLeft size={18} /></button>
          <button onClick={() => scroll("right")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-3 px-3 pb-4">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start bg-white p-5 sm:p-6 flex flex-col"
            style={{
              borderRadius: 16, border: `1px solid ${t.border}`, minWidth: 240,
              transition: "all 500ms cubic-bezier(0.16, 1, 0.3, 1)",
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transitionDelay: `${200 + i * 80}ms`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = t.shadow; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: t.avatarGrad }}>{t.avatar}</div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <BadgeCheck size={12} style={{ color: t.color }} />{t.role}
                </div>
              </div>
            </div>
            <div className="flex gap-0.5 mb-3">
              {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />)}
            </div>
            <p className="text-sm text-gray-600 italic leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
