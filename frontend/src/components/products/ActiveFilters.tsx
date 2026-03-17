"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export type FilterChip = {
  type: "category" | "price" | "rating" | "brand" | "color" | "size" | "shipping" | "discount";
  label: string;
  value: string;
};

const CHIP_COLORS: Record<FilterChip["type"], { bg: string; color: string; border: string }> = {
  category: { bg: "rgba(139,92,246,0.08)", color: "#8b5cf6", border: "rgba(139,92,246,0.2)" },
  price: { bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  rating: { bg: "rgba(245,158,11,0.08)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  brand: { bg: "rgba(6,182,212,0.08)", color: "#06b6d4", border: "rgba(6,182,212,0.2)" },
  color: { bg: "rgba(236,72,153,0.08)", color: "#ec4899", border: "rgba(236,72,153,0.2)" },
  size: { bg: "rgba(236,72,153,0.08)", color: "#ec4899", border: "rgba(236,72,153,0.2)" },
  shipping: { bg: "rgba(34,197,94,0.08)", color: "#22c55e", border: "rgba(34,197,94,0.2)" },
  discount: { bg: "rgba(239,68,68,0.08)", color: "#ef4444", border: "rgba(239,68,68,0.2)" },
};

type Props = {
  chips: FilterChip[];
  onRemove: (chip: FilterChip) => void;
  onClearAll: () => void;
};

export default function ActiveFilters({ chips, onRemove, onClearAll }: Props) {
  const t = useTranslations("filters");
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {chips.map((chip, i) => {
        const c = CHIP_COLORS[chip.type];
        return (
          <span
            key={`${chip.type}-${chip.value}-${i}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium py-1 px-3"
            style={{ borderRadius: 20, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
          >
            {chip.label}
            <button
              onClick={() => onRemove(chip)}
              className="hover:text-red-500 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        );
      })}
      <button
        onClick={onClearAll}
        className="text-xs font-medium text-purple-600 hover:underline ml-1"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}
