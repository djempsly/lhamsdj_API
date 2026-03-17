"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import {
  getProducts,
  deleteProduct,
  duplicateProduct,
  bulkProductAction,
  exportProductsCsv,
} from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import {
  Plus,
  Trash2,
  Pencil,
  Package,
  Search,
  Copy,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Product } from "@/types";
import { showToast } from "@/components/shared/Toast";

const ITEMS_PER_PAGE = 20;

const purpleGradient = "linear-gradient(135deg, #8b5cf6, #7c3aed)";
const purpleShadow = "rgba(139,92,246,0.25)";

type BulkAction = "delete" | "activate" | "deactivate" | "changeCategory" | "adjustPrice";

export default function AdminProductsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction | "">("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Bulk action extra params
  const [bulkCategoryId, setBulkCategoryId] = useState<number | "">("");
  const [bulkPricePercent, setBulkPricePercent] = useState("");

  // Categories for bulk change
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery]);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    const res = await getProducts({
      page,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearch || undefined,
    });
    setProducts(res.data ?? []);
    if (res.pagination) setPagination(res.pagination);
    setSelectedIds(new Set());
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Load categories once
  useEffect(() => {
    getCategories().then((res: any) => {
      if (res.success && res.data) setCategories(res.data);
      else if (Array.isArray(res)) setCategories(res);
    });
  }, []);

  // ---- Handlers ----

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteConfirm"))) return;
    const res = await deleteProduct(id);
    if (res.success) {
      showToast(t("productDeleted"), "success");
      loadProducts();
    } else {
      showToast(t("deleteError") + ": " + res.message, "error");
    }
  };

  const handleDuplicate = async (id: number) => {
    const res = await duplicateProduct(id);
    if (res.success) {
      showToast(t("duplicated"), "success");
      loadProducts();
    } else {
      showToast(res.message || "Error", "error");
    }
  };

  const handleExport = async () => {
    try {
      await exportProductsCsv();
      showToast(t("exportProducts") + " OK", "success");
    } catch {
      showToast(t("exportErrorMsg"), "error");
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const handleBulkExecute = async () => {
    if (!bulkAction || selectedIds.size === 0) return;

    if (bulkAction === "delete" && !confirm(t("bulkDeleteConfirm", { count: selectedIds.size }))) return;

    setBulkLoading(true);
    const ids = Array.from(selectedIds);
    let params: any = {};

    if (bulkAction === "changeCategory" && bulkCategoryId) {
      params = { categoryId: bulkCategoryId };
    }
    if (bulkAction === "adjustPrice" && bulkPricePercent) {
      params = { percent: parseFloat(bulkPricePercent) };
    }

    const res = await bulkProductAction(ids, bulkAction, params);
    setBulkLoading(false);

    if (res.success) {
      showToast(`${t("bulkActions")}: ${ids.length} products`, "success");
      setBulkAction("");
      setBulkCategoryId("");
      setBulkPricePercent("");
      loadProducts();
    } else {
      showToast(res.message || "Error", "error");
    }
  };

  // ---- Status badge ----

  const renderStatusBadge = (stock: number) => {
    if (stock === 0) {
      return (
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"
          style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}
        >
          <Package size={12} />
          Out of stock
        </span>
      );
    }
    if (stock <= 5) {
      return (
        <span
          className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"
          style={{ background: "rgba(245,158,11,0.1)", color: "#d97706" }}
        >
          <AlertTriangle size={12} />
          {stock}
        </span>
      );
    }
    return (
      <span
        className="px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"
        style={{ background: "rgba(34,197,94,0.1)", color: "#16a34a" }}
      >
        <Package size={12} />
        {stock}
      </span>
    );
  };

  // ---- Render ----

  return (
    <div>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">{t("myProducts")}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border transition hover:bg-gray-50"
            style={{ borderRadius: 10, borderColor: "#8b5cf6", color: "#8b5cf6" }}
          >
            <Download size={16} /> {t("exportProducts")}
          </button>
          <Link
            href="/admin/products/create"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            style={{
              borderRadius: 10,
              background: purpleGradient,
              boxShadow: `0 4px 14px ${purpleShadow}`,
            }}
          >
            <Plus size={16} /> {t("newProduct")}
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder={t("searchProducts")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
          style={{ borderRadius: 10 }}
        />
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div
          className="flex flex-wrap items-center gap-3 mb-4 p-3"
          style={{
            borderRadius: 10,
            background: "rgba(139,92,246,0.06)",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <span className="text-sm font-medium text-purple-700">
            {t("selectedCount", { count: selectedIds.size })}
          </span>

          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value as BulkAction | "")}
            className="text-sm border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
            style={{ borderRadius: 8 }}
          >
            <option value="">{t("bulkActions")}</option>
            <option value="delete">{tCommon("delete")}</option>
            <option value="activate">{t("bulkActivate")}</option>
            <option value="deactivate">{t("bulkDeactivate")}</option>
            <option value="changeCategory">{t("bulkSetCategory")}</option>
            <option value="adjustPrice">{t("bulkAdjustPrice")}</option>
          </select>

          {bulkAction === "changeCategory" && (
            <select
              value={bulkCategoryId}
              onChange={(e) => setBulkCategoryId(Number(e.target.value))}
              className="text-sm border border-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
              style={{ borderRadius: 8 }}
            >
              <option value="">{t("selectCategory")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          )}

          {bulkAction === "adjustPrice" && (
            <input
              type="number"
              placeholder="e.g. 10 or -15"
              value={bulkPricePercent}
              onChange={(e) => setBulkPricePercent(e.target.value)}
              className="text-sm border border-gray-200 px-3 py-1.5 w-32 focus:outline-none focus:ring-2 focus:ring-purple-400"
              style={{ borderRadius: 8 }}
            />
          )}

          <button
            onClick={handleBulkExecute}
            disabled={!bulkAction || bulkLoading}
            className="text-sm font-medium text-white px-4 py-1.5 disabled:opacity-50 transition hover:opacity-90"
            style={{
              borderRadius: 8,
              background: purpleGradient,
              boxShadow: `0 2px 8px ${purpleShadow}`,
            }}
          >
            {bulkLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              t("applyBulk")
            )}
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className="bg-white shadow-sm border overflow-hidden"
        style={{ borderRadius: 12 }}
      >
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
            <Loader2 size={20} className="animate-spin" />
            {t("loadingProducts")}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.size === products.length}
                    onChange={toggleSelectAll}
                    className="rounded accent-purple-600"
                    title={t("selectAll")}
                  />
                </th>
                <th className="p-4 font-medium text-gray-500 text-sm">{tCommon("image")}</th>
                <th className="p-4 font-medium text-gray-500 text-sm">{tCommon("name")}</th>
                <th className="p-4 font-medium text-gray-500 text-sm">{tCommon("category")}</th>
                <th className="p-4 font-medium text-gray-500 text-sm">{tCommon("price")}</th>
                <th className="p-4 font-medium text-gray-500 text-sm">{tCommon("stock")}</th>
                <th className="p-4 font-medium text-gray-500 text-sm text-right">{tCommon("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className={`border-b transition ${
                    selectedIds.has(product.id) ? "bg-purple-50/50" : "hover:bg-gray-50"
                  }`}
                >
                  {/* Checkbox */}
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded accent-purple-600"
                    />
                  </td>

                  {/* Image */}
                  <td className="p-4">
                    <div className="relative w-12 h-12 bg-gray-100 rounded-md overflow-hidden border">
                      <Image
                        src={product.images[0]?.url || "https://via.placeholder.com/100"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>

                  {/* Name */}
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">{tCommon("id")}: {product.id}</p>
                  </td>

                  {/* Category */}
                  <td className="p-4 text-sm text-gray-600">
                    {product.category?.name || "\u2014"}
                  </td>

                  {/* Price */}
                  <td className="p-4 font-medium">${product.price}</td>

                  {/* Status badge */}
                  <td className="p-4">{renderStatusBadge(product.stock)}</td>

                  {/* Actions */}
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleDuplicate(product.id)}
                        className="text-purple-600 hover:bg-purple-50 p-2 rounded-full transition"
                        title={t("duplicateProduct")}
                      >
                        <Copy size={16} />
                      </button>
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition inline-flex"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    {t("noProductsYet")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">
              {pagination.total} products &middot; {tCommon("page", { current: pagination.page, total: pagination.totalPages })}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className="p-2 rounded-lg border bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => {
                  const current = pagination.page;
                  return p === 1 || p === pagination.totalPages || Math.abs(p - current) <= 1;
                })
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`dots-${idx}`} className="px-1 text-gray-400 text-sm">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item as number)}
                      className="w-8 h-8 text-sm font-medium transition"
                      style={
                        item === pagination.page
                          ? { borderRadius: 8, background: purpleGradient, color: "#fff", boxShadow: `0 2px 8px ${purpleShadow}` }
                          : { borderRadius: 8, background: "#fff", border: "1px solid #e5e7eb", color: "#374151" }
                      }
                    >
                      {item}
                    </button>
                  )
                )}
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNext}
                className="p-2 rounded-lg border bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
