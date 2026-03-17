"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, PackageSearch } from "lucide-react";
import type { Product } from "@/types";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import ProductCard from "@/components/products/ProductCard";
import FilterSidebar, { type FiltersState, type FiltersData } from "@/components/products/FilterSidebar";
import ActiveFilters, { type FilterChip } from "@/components/products/ActiveFilters";
import ProductToolbar from "@/components/products/ProductToolbar";
import Pagination from "@/components/shared/Pagination";
import { SkeletonGrid } from "@/components/shared/SkeletonCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ═══ URL ↔ State helpers ═══ */
function filtersFromParams(sp: URLSearchParams): FiltersState {
  const f: FiltersState = {};
  if (sp.get("categoryId")) f.categoryId = Number(sp.get("categoryId"));
  if (sp.get("minPrice")) f.minPrice = Number(sp.get("minPrice"));
  if (sp.get("maxPrice")) f.maxPrice = Number(sp.get("maxPrice"));
  if (sp.get("minRating")) f.minRating = Number(sp.get("minRating"));
  if (sp.get("vendorId")) f.vendorId = Number(sp.get("vendorId"));
  if (sp.get("color")) f.color = sp.get("color")!;
  if (sp.get("size")) f.size = sp.get("size")!;
  if (sp.get("inStock") === "true") f.inStock = true;
  return f;
}

function filtersToParams(f: FiltersState): Record<string, string> {
  const p: Record<string, string> = {};
  if (f.categoryId) p.categoryId = String(f.categoryId);
  if (f.minPrice !== undefined && f.minPrice > 0) p.minPrice = String(f.minPrice);
  if (f.maxPrice !== undefined) p.maxPrice = String(f.maxPrice);
  if (f.minRating) p.minRating = String(f.minRating);
  if (f.vendorId) p.vendorId = String(f.vendorId);
  if (f.color) p.color = f.color;
  if (f.size) p.size = f.size;
  if (f.inStock) p.inStock = "true";
  return p;
}

/* ═══ Content ═══ */
function ProductsContent() {
  const t = useTranslations("products");
  const tf = useTranslations("filters");
  const searchParams = useSearchParams();
  const router = useRouter();

  /* state */
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersData, setFiltersData] = useState<FiltersData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  /* derive from URL */
  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "newest";
  const view = (searchParams.get("view") as "grid" | "list") || "grid";
  const limit = 20;
  const filters = filtersFromParams(searchParams);

  /* update URL */
  const updateParams = useCallback((updates: Record<string, string>, resetPage = true) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (resetPage && !updates.page) params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  }, [searchParams, router]);

  const handleFiltersChange = useCallback((newFilters: FiltersState) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("sort", sort);
    params.set("view", view);
    params.set("page", "1");
    const fp = filtersToParams(newFilters);
    Object.entries(fp).forEach(([k, v]) => params.set(k, v));
    router.push(`/products?${params.toString()}`);
  }, [search, sort, view, router]);

  /* fetch products from /search */
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("sort", sort);
    if (search) params.set("q", search);
    if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
    if (filters.minPrice !== undefined && filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.minRating) params.set("minRating", String(filters.minRating));
    if (filters.vendorId) params.set("vendorId", String(filters.vendorId));
    if (filters.color) params.set("color", filters.color);
    if (filters.size) params.set("size", filters.size);
    if (filters.inStock) params.set("inStock", "true");

    fetch(`${API_URL}/search?${params.toString()}`)
      .then(r => r.json())
      .then(json => {
        setProducts(json.data || []);
        setTotal(json.pagination?.total || 0);
        setTotalPages(json.pagination?.totalPages || 0);
      })
      .catch(() => { setProducts([]); setTotal(0); setTotalPages(0); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, sort, filters.categoryId, filters.minPrice, filters.maxPrice, filters.minRating, filters.vendorId, filters.color, filters.size, filters.inStock]);

  /* fetch filter facets */
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set("categoryId", String(filters.categoryId));
    if (search) params.set("q", search);

    fetch(`${API_URL}/search/filters?${params.toString()}`)
      .then(r => r.json())
      .then(json => { if (json.success) setFiltersData(json.data); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.categoryId, search]);

  /* build active filter chips */
  const chips: FilterChip[] = [];
  if (filters.categoryId && filtersData) {
    const cat = filtersData.categories.find(c => c.id === filters.categoryId);
    if (cat) chips.push({ type: "category", label: cat.name, value: String(cat.id) });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const label = `$${filters.minPrice ?? 0} – $${filters.maxPrice ?? "∞"}`;
    chips.push({ type: "price", label, value: `${filters.minPrice ?? ""}-${filters.maxPrice ?? ""}` });
  }
  if (filters.minRating) {
    chips.push({ type: "rating", label: `${filters.minRating}★ ${tf("up")}`, value: String(filters.minRating) });
  }
  if (filters.vendorId && filtersData) {
    const v = filtersData.vendors.find(v => v.id === filters.vendorId);
    if (v) chips.push({ type: "brand", label: v.businessName, value: String(v.id) });
  }
  if (filters.color) {
    filters.color.split(",").forEach(c => chips.push({ type: "color", label: c, value: c }));
  }
  if (filters.size) {
    filters.size.split(",").forEach(s => chips.push({ type: "size", label: s, value: s }));
  }
  if (filters.inStock) {
    chips.push({ type: "shipping", label: tf("inStockOnly"), value: "true" });
  }

  const handleRemoveChip = useCallback((chip: FilterChip) => {
    const next = { ...filters };
    switch (chip.type) {
      case "category": delete next.categoryId; break;
      case "price": delete next.minPrice; delete next.maxPrice; break;
      case "rating": delete next.minRating; break;
      case "brand": delete next.vendorId; break;
      case "color": {
        const colors = (next.color || "").split(",").filter(c => c !== chip.value);
        next.color = colors.length ? colors.join(",") : undefined;
        break;
      }
      case "size": {
        const sizes = (next.size || "").split(",").filter(s => s !== chip.value);
        next.size = sizes.length ? sizes.join(",") : undefined;
        break;
      }
      case "shipping": delete next.inStock; break;
    }
    handleFiltersChange(next);
  }, [filters, handleFiltersChange]);

  const handleClearAll = useCallback(() => {
    handleFiltersChange({});
  }, [handleFiltersChange]);

  const activeFilterCount = chips.length;

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <Breadcrumbs items={[
        { label: search ? `${t("resultsFor")} "${search}"` : t("allProducts") },
      ]} />

      {/* Title + mobile filter button */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            {search ? `${t("resultsFor")} "${search}"` : t("allProducts")}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{total} {t("found")}</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex items-center gap-2 border px-4 py-2.5 text-sm font-medium transition-colors hover:border-purple-400"
          style={{ borderRadius: 10 }}
        >
          <SlidersHorizontal size={16} />
          {tf("title")}
          {activeFilterCount > 0 && (
            <span
              className="text-xs font-bold text-white px-1.5 py-0.5"
              style={{ borderRadius: 10, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden lg:block w-[280px] flex-shrink-0">
          <div className="sticky top-4">
            <FilterSidebar
              filters={filters}
              filtersData={filtersData}
              onChange={handleFiltersChange}
            />
          </div>
        </aside>

        {/* ─── Main Content ─── */}
        <div className="flex-1 min-w-0">
          {/* Active filters */}
          <ActiveFilters chips={chips} onRemove={handleRemoveChip} onClearAll={handleClearAll} />

          {/* Toolbar */}
          <ProductToolbar
            total={total}
            page={page}
            limit={limit}
            sort={sort}
            view={view}
            onSortChange={(s) => updateParams({ sort: s })}
            onViewChange={(v) => updateParams({ view: v }, false)}
          />

          {/* Product grid / list */}
          {loading ? (
            <SkeletonGrid
              count={8}
              variant={view === "list" ? "horizontal" : "default"}
              columns={view === "list" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"}
            />
          ) : products.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16">
              <div
                className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
                style={{ borderRadius: 20, background: "rgba(139,92,246,0.08)" }}
              >
                <PackageSearch size={36} className="text-purple-400" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-1">{tf("noResults")}</p>
              <p className="text-sm text-gray-400 mb-6">{tf("noResultsDesc")}</p>
              <button
                onClick={handleClearAll}
                className="text-white text-sm font-semibold px-6 py-2.5 transition-all hover:shadow-lg"
                style={{
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  boxShadow: "0 4px 14px rgba(139,92,246,0.3)",
                }}
              >
                {tf("clearFilters")}
              </button>
            </div>
          ) : (
            <div className={
              view === "list"
                ? "grid grid-cols-1 gap-3"
                : "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
            }>
              {products.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  colorIndex={i}
                  variant={view === "list" ? "horizontal" : "default"}
                  showStars
                  showShipping
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => updateParams({ page: String(p) }, false)}
            />
          )}
        </div>
      </div>

      {/* ─── Mobile Filter Drawer ─── */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            style={{ animation: "fadeIn .2s ease" }}
          />
          {/* Drawer */}
          <div
            className="fixed inset-y-0 left-0 w-[320px] max-w-[85vw] bg-white z-50 lg:hidden shadow-2xl"
            style={{ animation: "slideInLeft .3s cubic-bezier(0.16,1,0.3,1)" }}
          >
            <FilterSidebar
              filters={filters}
              filtersData={filtersData}
              onChange={(f) => { handleFiltersChange(f); setMobileOpen(false); }}
              isMobile
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInLeft { from { transform: translateX(-100%) } to { transform: translateX(0) } }
      `}</style>
    </main>
  );
}

function ProductsPageFallback() {
  const t = useTranslations("products");
  return <div className="container mx-auto px-4 py-8 text-center">{t("loadingProducts")}</div>;
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsContent />
    </Suspense>
  );
}
