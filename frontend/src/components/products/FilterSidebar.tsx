"use client";

import { useState, useCallback } from "react";
import { ChevronDown, Star, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

/* ═══ Types ═══ */
export type FiltersState = {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  vendorId?: number;
  color?: string;
  size?: string;
  inStock?: boolean;
};

export type FiltersData = {
  priceRange: { min: number; max: number };
  categories: { id: number; name: string; slug: string; parentId: number | null; _count: { products: number } }[];
  vendors: { id: number; businessName: string; slug: string; _count: { products: number } }[];
  colors: string[];
  sizes: string[];
};

type Props = {
  filters: FiltersState;
  filtersData: FiltersData | null;
  onChange: (filters: FiltersState) => void;
  isMobile?: boolean;
  onClose?: () => void;
};

/* ═══ Main Component ═══ */
export default function FilterSidebar({ filters, filtersData, onChange, isMobile, onClose }: Props) {
  const t = useTranslations("filters");

  const update = useCallback((patch: Partial<FiltersState>) => {
    onChange({ ...filters, ...patch });
  }, [filters, onChange]);

  if (!filtersData) return <SidebarSkeleton />;

  return (
    <div className={isMobile ? "flex flex-col h-full" : ""}>
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">{t("title")}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
      )}

      <div className={`space-y-0 ${isMobile ? "flex-1 overflow-y-auto p-4" : ""}`}>
        {/* ─── Categories ─── */}
        <FilterSection title={t("categories")} defaultOpen>
          <div className="space-y-1">
            {filtersData.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => update({ categoryId: filters.categoryId === cat.id ? undefined : cat.id })}
                className="w-full flex items-center gap-2 py-1.5 px-1 text-left text-sm transition-colors rounded"
                style={{ color: filters.categoryId === cat.id ? "#8b5cf6" : "#4b5563", fontWeight: filters.categoryId === cat.id ? 600 : 400 }}
              >
                <span
                  className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: filters.categoryId === cat.id ? "#8b5cf6" : "#d1d5db",
                    background: filters.categoryId === cat.id ? "#8b5cf6" : "transparent",
                  }}
                >
                  {filters.categoryId === cat.id && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </span>
                <span className="flex-1 truncate">{cat.name}</span>
                <span className="text-[11px] text-gray-400">({cat._count.products})</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* ─── Price Range ─── */}
        <FilterSection title={t("priceRange")} defaultOpen>
          <PriceSlider
            min={filtersData.priceRange.min}
            max={filtersData.priceRange.max}
            currentMin={filters.minPrice}
            currentMax={filters.maxPrice}
            onChange={(minPrice, maxPrice) => update({ minPrice, maxPrice })}
          />
        </FilterSection>

        {/* ─── Rating ─── */}
        <FilterSection title={t("rating")} defaultOpen>
          <div className="space-y-0.5">
            {[4, 3, 2, 1].map(r => (
              <button
                key={r}
                onClick={() => update({ minRating: filters.minRating === r ? undefined : r })}
                className="w-full flex items-center gap-2 py-1.5 px-1.5 text-sm transition-all rounded"
                style={{
                  background: filters.minRating === r ? "rgba(245,158,11,0.08)" : "transparent",
                  borderRadius: 6,
                }}
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => <Star key={s} size={13} className={s <= r ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />)}
                </div>
                <span className="text-xs text-gray-500">& {t("up")}</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* ─── Brands ─── */}
        {filtersData.vendors.length > 0 && (
          <FilterSection title={t("brands")}>
            <BrandFilter
              vendors={filtersData.vendors}
              selected={filters.vendorId}
              onChange={(vendorId) => update({ vendorId })}
            />
          </FilterSection>
        )}

        {/* ─── Colors ─── */}
        {filtersData.colors.length > 0 && (
          <FilterSection title={t("colors")}>
            <div className="flex flex-wrap gap-2">
              {filtersData.colors.map(color => {
                const selected = filters.color === color;
                return (
                  <button
                    key={color}
                    onClick={() => update({ color: selected ? undefined : color })}
                    className="group relative"
                    title={color}
                  >
                    <span
                      className="block w-7 h-7 rounded-full transition-all"
                      style={{
                        background: color.startsWith("#") ? color : "#6b7280",
                        boxShadow: selected
                          ? "0 0 0 3px white, 0 0 0 5px #8b5cf6, 0 0 12px rgba(139,92,246,0.25)"
                          : "inset 0 0 0 1px rgba(0,0,0,0.1)",
                        transform: selected ? "scale(1)" : "scale(1)",
                      }}
                    />
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {color}
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* ─── Sizes ─── */}
        {filtersData.sizes.length > 0 && (
          <FilterSection title={t("sizes")}>
            <div className="flex flex-wrap gap-1.5">
              {filtersData.sizes.map(size => {
                const selected = filters.size === size;
                return (
                  <button
                    key={size}
                    onClick={() => update({ size: selected ? undefined : size })}
                    className="min-w-[36px] px-2.5 py-1.5 text-xs font-medium transition-all"
                    style={{
                      borderRadius: 8,
                      border: selected ? "1.5px solid #8b5cf6" : "1.5px solid #e5e7eb",
                      background: selected ? "rgba(139,92,246,0.08)" : "transparent",
                      color: selected ? "#8b5cf6" : "#6b7280",
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}

        {/* ─── In Stock Toggle ─── */}
        <FilterSection title={t("availability")}>
          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-sm text-gray-600">{t("inStockOnly")}</span>
            <Toggle checked={!!filters.inStock} onChange={(v) => update({ inStock: v || undefined })} color="#22c55e" />
          </label>
        </FilterSection>
      </div>

      {/* Mobile apply button */}
      {isMobile && (
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full text-white font-bold py-3 text-sm transition-all active:scale-[0.98]"
            style={{ borderRadius: 10, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", boxShadow: "0 4px 12px rgba(139,92,246,0.25)" }}
          >
            {t("apply")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══ Collapsible filter section ═══ */
function FilterSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <span className="text-[13px] font-medium text-gray-800">{title}</span>
        <ChevronDown size={14} className="text-gray-400 transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </button>
      <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: open ? 500 : 0, opacity: open ? 1 : 0, marginTop: open ? 10 : 0 }}>
        {children}
      </div>
    </div>
  );
}

/* ═══ Price slider ═══ */
function PriceSlider({ min, max, currentMin, currentMax, onChange }: {
  min: number; max: number; currentMin?: number; currentMax?: number;
  onChange: (min?: number, max?: number) => void;
}) {
  const lo = currentMin ?? min;
  const hi = currentMax ?? max;
  const range = max - min || 1;

  return (
    <div>
      <div className="relative h-6 mb-3">
        {/* Track background */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full" />
        {/* Active fill */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full"
          style={{
            left: `${((lo - min) / range) * 100}%`,
            right: `${100 - ((hi - min) / range) * 100}%`,
            background: "#8b5cf6",
          }}
        />
        {/* Min thumb */}
        <input
          type="range" min={min} max={max} step={1} value={lo}
          onChange={(e) => onChange(Math.min(Number(e.target.value), hi - 1), currentMax)}
          className="price-range-thumb"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", WebkitAppearance: "none", appearance: "none", background: "transparent", pointerEvents: "none", zIndex: 3 }}
        />
        {/* Max thumb */}
        <input
          type="range" min={min} max={max} step={1} value={hi}
          onChange={(e) => onChange(currentMin, Math.max(Number(e.target.value), lo + 1))}
          className="price-range-thumb"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", WebkitAppearance: "none", appearance: "none", background: "transparent", pointerEvents: "none", zIndex: 4 }}
        />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
          <input
            type="number" value={lo} min={min} max={hi}
            onChange={(e) => onChange(Number(e.target.value) || undefined, currentMax)}
            className="w-full pl-6 pr-2 py-1.5 border text-sm focus:border-purple-400 outline-none"
            style={{ borderRadius: 8 }}
          />
        </div>
        <span className="text-gray-300 self-center">—</span>
        <div className="flex-1 relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
          <input
            type="number" value={hi} min={lo} max={max}
            onChange={(e) => onChange(currentMin, Number(e.target.value) || undefined)}
            className="w-full pl-6 pr-2 py-1.5 border text-sm focus:border-purple-400 outline-none"
            style={{ borderRadius: 8 }}
          />
        </div>
      </div>
      <style jsx>{`
        .price-range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none; pointer-events: auto;
          width: 18px; height: 18px; border-radius: 50%;
          background: white; border: 2px solid #8b5cf6;
          box-shadow: 0 2px 6px rgba(139,92,246,0.3); cursor: pointer;
        }
        .price-range-thumb::-moz-range-thumb {
          pointer-events: auto; width: 18px; height: 18px; border-radius: 50%;
          background: white; border: 2px solid #8b5cf6;
          box-shadow: 0 2px 6px rgba(139,92,246,0.3); cursor: pointer;
        }
      `}</style>
    </div>
  );
}

/* ═══ Brand filter with search ═══ */
function BrandFilter({ vendors, selected, onChange }: {
  vendors: FiltersData["vendors"]; selected?: number; onChange: (id?: number) => void;
}) {
  const t = useTranslations("filters");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = search ? vendors.filter(v => v.businessName.toLowerCase().includes(search.toLowerCase())) : vendors;
  const displayed = showAll ? filtered : filtered.slice(0, 8);

  return (
    <div>
      <div className="relative mb-2">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchBrands")}
          className="w-full pl-8 pr-2 py-1.5 border text-xs focus:border-purple-400 outline-none"
          style={{ borderRadius: 8 }}
        />
      </div>
      <div className="space-y-1">
        {displayed.map(v => (
          <button
            key={v.id}
            onClick={() => onChange(selected === v.id ? undefined : v.id)}
            className="w-full flex items-center gap-2 py-1 px-1 text-left text-sm rounded transition-colors"
            style={{ color: selected === v.id ? "#8b5cf6" : "#4b5563", fontWeight: selected === v.id ? 600 : 400 }}
          >
            <span
              className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0"
              style={{
                borderColor: selected === v.id ? "#8b5cf6" : "#d1d5db",
                background: selected === v.id ? "#8b5cf6" : "transparent",
              }}
            >
              {selected === v.id && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </span>
            <span className="flex-1 truncate">{v.businessName}</span>
            <span className="text-[11px] text-gray-400">({v._count.products})</span>
          </button>
        ))}
      </div>
      {filtered.length > 8 && !showAll && (
        <button onClick={() => setShowAll(true)} className="text-xs text-purple-600 mt-2 hover:underline">{t("showMore")}</button>
      )}
    </div>
  );
}

/* ═══ Toggle switch ═══ */
function Toggle({ checked, onChange, color }: { checked: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-10 h-[22px] rounded-full relative transition-colors duration-200 flex-shrink-0"
      style={{ background: checked ? color : "#d1d5db" }}
    >
      <span
        className="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200"
        style={{ left: checked ? 20 : 2 }}
      />
    </button>
  );
}

/* ═══ Skeleton ═══ */
function SidebarSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="space-y-2 py-3 border-b border-gray-100">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-100 rounded w-full" />
          <div className="h-6 bg-gray-100 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}
