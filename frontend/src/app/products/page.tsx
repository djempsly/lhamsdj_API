"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getProducts } from "@/services/productService";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product, Pagination } from "@/types";

function ProductsContent() {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "createdAt";
  const order = (searchParams.get("order") || "desc") as "asc" | "desc";
  const categoryId = searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined;

  useEffect(() => {
    setLoading(true);
    getProducts({ page, search, sort, order, categoryId, limit: 20 }).then((res) => {
      setProducts(res.data);
      setPagination(res.pagination);
      setLoading(false);
    });
  }, [page, search, sort, order, categoryId]);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    if (updates.page === undefined) params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{search ? `${t("resultsFor")} "${search}"` : t("allProducts")}</h1>
          {pagination && <p className="text-xs sm:text-sm text-gray-500 mt-1">{pagination.total} {t("found")}</p>}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={`${sort}-${order}`}
            onChange={(e) => { const [s, o] = e.target.value.split("-"); updateParams({ sort: s, order: o }); }}
            className="text-sm border rounded-lg px-3 min-h-[44px] bg-white touch-manipulation flex-1 sm:flex-none"
          >
            <option value="createdAt-desc">{t("newest")}</option>
            <option value="price-asc">{t("priceLowHigh")}</option>
            <option value="price-desc">{t("priceHighLow")}</option>
            <option value="name-asc">{t("nameAZ")}</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center border rounded-lg touch-manipulation">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg aspect-[3/4] animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 sm:py-20">
          <p className="text-lg sm:text-xl text-gray-400">{t("noProducts")}</p>
          <Link href="/products" className="text-blue-600 text-sm mt-2 inline-flex items-center min-h-[44px] touch-manipulation">{t("viewAll")}</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group touch-manipulation">
              <div className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="relative aspect-square bg-gray-50">
                  <Image
                    src={product.images?.[0]?.url || "https://via.placeholder.com/300"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                </div>
                <div className="p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-medium truncate">{product.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{product.category?.name}</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm sm:text-lg font-bold">
                      {product.localPrice ? `${product.localCurrency} ${product.localPrice}` : `$${product.price}`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
          <button disabled={!pagination.hasPrev} onClick={() => updateParams({ page: String(page - 1) })}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center border rounded-lg disabled:opacity-30 hover:bg-gray-50 touch-manipulation">
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-600 px-3 sm:px-4">
            {tc("page", { current: pagination.page, total: pagination.totalPages })}
          </span>
          <button disabled={!pagination.hasNext} onClick={() => updateParams({ page: String(page + 1) })}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center border rounded-lg disabled:opacity-30 hover:bg-gray-50 touch-manipulation">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
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
