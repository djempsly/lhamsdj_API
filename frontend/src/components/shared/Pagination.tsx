"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="w-9 h-9 flex items-center justify-center border transition-all disabled:opacity-40"
        style={{ borderRadius: 8, borderColor: "#e5e7eb" }}
        onMouseEnter={(e) => { if (page > 1) e.currentTarget.style.borderColor = "#8b5cf6"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="w-9 h-9 flex items-center justify-center text-sm font-medium transition-all"
            style={{
              borderRadius: 8,
              background: p === page ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "transparent",
              color: p === page ? "white" : "#6b7280",
              border: p === page ? "none" : "0.5px solid #e5e7eb",
              boxShadow: p === page ? "0 2px 8px rgba(139,92,246,0.3)" : "none",
            }}
            onMouseEnter={(e) => { if (p !== page) e.currentTarget.style.borderColor = "#8b5cf6"; }}
            onMouseLeave={(e) => { if (p !== page) e.currentTarget.style.borderColor = "#e5e7eb"; }}
          >
            {p}
          </button>
        )
      )}

      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="w-9 h-9 flex items-center justify-center border transition-all disabled:opacity-40"
        style={{ borderRadius: 8, borderColor: "#e5e7eb" }}
        onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.borderColor = "#8b5cf6"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
