"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type Crumb = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  const { ref, visible } = useScrollReveal(0.3);

  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm py-3 overflow-x-auto scrollbar-hide"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(8px)", transition: "all 500ms ease" }}
    >
      <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-purple-600 transition-colors flex-shrink-0">
        <Home size={14} />
      </Link>
      {items.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5 flex-shrink-0" style={{ opacity: visible ? 1 : 0, transition: "opacity 400ms ease", transitionDelay: `${(i + 1) * 80}ms` }}>
          <ChevronRight size={13} className="text-gray-300" />
          {crumb.href ? (
            <Link href={crumb.href} className="text-purple-600 hover:text-purple-800 font-medium transition-colors whitespace-nowrap">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium truncate max-w-[200px]">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
