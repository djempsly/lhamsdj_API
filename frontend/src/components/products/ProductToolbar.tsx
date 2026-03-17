"use client";

import { LayoutGrid, List } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  total: number;
  page: number;
  limit: number;
  sort: string;
  view: "grid" | "list";
  onSortChange: (sort: string) => void;
  onViewChange: (view: "grid" | "list") => void;
};

export default function ProductToolbar({ total, page, limit, sort, view, onSortChange, onViewChange }: Props) {
  const t = useTranslations("filters");

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <p className="text-[13px] text-gray-500">
        {t("showing", { from, to, total })}
      </p>

      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="text-sm border px-3 py-2 bg-white focus:border-purple-400 focus:ring-1 focus:ring-purple-200 outline-none transition-colors"
          style={{ borderRadius: 8 }}
        >
          <option value="newest">{t("sortNewest")}</option>
          <option value="price_asc">{t("sortPriceAsc")}</option>
          <option value="price_desc">{t("sortPriceDesc")}</option>
          <option value="name_asc">{t("sortNameAZ")}</option>
          <option value="best_selling">{t("sortBestSelling")}</option>
        </select>

        {/* View toggle */}
        <div className="hidden sm:flex border overflow-hidden" style={{ borderRadius: 8 }}>
          <button
            onClick={() => onViewChange("grid")}
            className="w-9 h-9 flex items-center justify-center transition-all"
            style={{
              background: view === "grid" ? "rgba(139,92,246,0.08)" : "transparent",
              color: view === "grid" ? "#8b5cf6" : "#9ca3af",
              borderRight: "1px solid #e5e7eb",
            }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className="w-9 h-9 flex items-center justify-center transition-all"
            style={{
              background: view === "list" ? "rgba(139,92,246,0.08)" : "transparent",
              color: view === "list" ? "#8b5cf6" : "#9ca3af",
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
