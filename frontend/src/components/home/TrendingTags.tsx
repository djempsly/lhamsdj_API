"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TAGS = [
  { label: "Wireless earbuds", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.2)" },
  { label: "Spring fashion", color: "#ec4899", bg: "rgba(236,72,153,0.1)", border: "rgba(236,72,153,0.2)" },
  { label: "Smart watches", color: "#06b6d4", bg: "rgba(6,182,212,0.1)", border: "rgba(6,182,212,0.2)" },
  { label: "Home office", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
  { label: "Outdoor gear", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" },
  { label: "Gaming setup", color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" },
  { label: "Skin care", color: "#d946ef", bg: "rgba(217,70,239,0.1)", border: "rgba(217,70,239,0.2)" },
  { label: "Running shoes", color: "#0891b2", bg: "rgba(8,145,178,0.1)", border: "rgba(8,145,178,0.2)" },
];

export default function TrendingTags() {
  const { ref, visible } = useScrollReveal(0.3);

  return (
    <section ref={ref} className="mb-10 sm:mb-14" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 600ms ease" }}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trending now</span>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {TAGS.map((tag, i) => (
          <Link
            key={tag.label}
            href={`/products?search=${encodeURIComponent(tag.label)}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-300"
            style={{
              borderRadius: 20, background: tag.bg, color: tag.color, border: `1px solid ${tag.border}`,
              opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)",
              transitionDelay: `${i * 50}ms`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 4px 16px ${tag.border}`; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {tag.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
