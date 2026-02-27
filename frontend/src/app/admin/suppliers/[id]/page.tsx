"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  getSupplier,
  getSupplierOrders,
  linkProductToSupplier,
  unlinkProductFromSupplier,
  importSupplierProducts,
  fulfillOrder,
} from "@/services/adminService";
import { getProducts } from "@/services/productService";
import {
  ArrowLeft,
  Link as LinkIcon,
  Unlink,
  Package,
  Download,
  Truck,
  Loader2,
} from "lucide-react";

type TabKey = "products" | "orders" | "import";

interface Supplier {
  id: number;
  name: string;
  apiType: string;
  country: string;
  currency: string;
  status: string;
  products?: { id: number; productId: number; supplierSku: string; supplierPrice: number; product: { name: string } }[];
}

interface SupplierOrder {
  id: number;
  orderId: number;
  externalOrderId: string | null;
  status: string;
  trackingNumber: string | null;
  createdAt: string;
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PLACED: "bg-blue-100 text-blue-800",
  SENT_TO_SUPPLIER: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default function AdminSupplierDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [allProducts, setAllProducts] = useState<{ id: number; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("products");
  const [loading, setLoading] = useState(true);
  const [linkLoading, setLinkLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [fulfillingId, setFulfillingId] = useState<number | null>(null);

  // Link form state
  const [linkProductId, setLinkProductId] = useState<number | "">("");
  const [linkExternalSku, setLinkExternalSku] = useState("");
  const [linkExternalPrice, setLinkExternalPrice] = useState("");

  const loadData = async () => {
    if (!id || isNaN(id)) return;
    setLoading(true);
    setImportResult(null);
    try {
      const [suppRes, ordRes, prodRes] = await Promise.all([
        getSupplier(id),
        getSupplierOrders(id),
        getProducts({ limit: 1000 }),
      ]);

      if (suppRes.success && suppRes.data) setSupplier(suppRes.data);
      if (ordRes.success && (ordRes as any).data) setOrders((ordRes as any).data);
      if (prodRes?.data) setAllProducts(prodRes.data.map((p: any) => ({ id: p.id, name: p.name })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleLinkProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !linkProductId || !linkExternalSku || !linkExternalPrice) return;
    const productIdNum = Number(linkProductId);
    const priceNum = parseFloat(linkExternalPrice);
    if (isNaN(productIdNum) || isNaN(priceNum)) return;

    setLinkLoading(true);
    const res = await linkProductToSupplier(id, {
      productId: productIdNum,
      externalSku: linkExternalSku,
      externalPrice: priceNum,
    });
    setLinkLoading(false);

    if (res.success) {
      setLinkProductId("");
      setLinkExternalSku("");
      setLinkExternalPrice("");
      loadData();
    } else {
      alert(tCommon("error") + ": " + (res.message || "Unknown error"));
    }
  };

  const handleUnlinkProduct = async (productId: number) => {
    if (!confirm(t("unlinkProduct") + "?")) return;
    const res = await unlinkProductFromSupplier(id, productId);
    if (res.success) loadData();
    else alert(res.message);
  };

  const handleImport = async () => {
    setImportLoading(true);
    setImportResult(null);
    const res = await importSupplierProducts(id);
    setImportLoading(false);
    if (res.success) {
      setImportResult({ success: true, message: res.message || t("importSuccess") });
      loadData();
    } else {
      setImportResult({ success: false, message: res.message || tCommon("error") });
    }
  };

  const handleFulfill = async (orderId: number) => {
    if (!confirm(t("fulfillOrder") + "?")) return;
    setFulfillingId(orderId);
    const res = await fulfillOrder(orderId);
    setFulfillingId(null);
    if (res.success) loadData();
    else alert(res.message);
  };

  if (!id || isNaN(id)) {
    return (
      <div className="p-8">
        <Link href="/admin/suppliers" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6">
          <ArrowLeft size={18} /> {tCommon("back")}
        </Link>
        <p className="text-gray-600">Invalid supplier ID</p>
      </div>
    );
  }

  if (loading && !supplier) {
    return (
      <div className="p-8">
        <p className="text-gray-500">{tCommon("loading")}</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-8">
        <Link href="/admin/suppliers" className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6">
          <ArrowLeft size={18} /> {tCommon("back")}
        </Link>
        <p className="text-gray-600">Supplier not found</p>
      </div>
    );
  }

  const linkedProducts = supplier.products || [];

  const tabs = [
    { key: "products" as TabKey, label: t("linkedProducts"), icon: LinkIcon },
    { key: "orders" as TabKey, label: t("supplierOrders"), icon: Package },
    { key: "import" as TabKey, label: t("importProducts"), icon: Download },
  ];

  return (
    <div className="p-6">
      <Link
        href="/admin/suppliers"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition"
      >
        <ArrowLeft size={18} /> {tCommon("back")}
      </Link>

      {/* Supplier header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">{supplier.apiType}</span>
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              supplier.status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : supplier.status === "PAUSED"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {supplier.status}
          </span>
          <span className="text-gray-500">
            {supplier.country} · {supplier.currency}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === key
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Link Product form */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">{t("linkProduct")}</h2>
            <form onSubmit={handleLinkProduct} className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("name")}</label>
                <select
                  value={linkProductId}
                  onChange={(e) => setLinkProductId(Number(e.target.value) || "")}
                  className="w-full p-2 border rounded-lg bg-white"
                  required
                >
                  <option value="">{tCommon("search")}...</option>
                  {allProducts
                    .filter((p) => !linkedProducts.some((lp) => lp.productId === p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  {allProducts.filter((p) => !linkedProducts.some((lp) => lp.productId === p.id)).length === 0 &&
                    allProducts.length > 0 && (
                      <option value="" disabled>
                        —
                      </option>
                    )}
                </select>
              </div>
              <div className="min-w-[140px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("externalSku")}</label>
                <input
                  type="text"
                  value={linkExternalSku}
                  onChange={(e) => setLinkExternalSku(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="SKU"
                  required
                />
              </div>
              <div className="min-w-[120px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("externalPrice")}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={linkExternalPrice}
                  onChange={(e) => setLinkExternalPrice(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="0.00"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={linkLoading}
                className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
              >
                {linkLoading ? <Loader2 size={18} className="animate-spin" /> : <LinkIcon size={18} />}
                {t("linkProduct")}
              </button>
            </form>
          </div>

          {/* Linked products table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <h2 className="text-lg font-semibold p-4 border-b">{t("linkedProducts")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-medium text-gray-500">{tCommon("name")}</th>
                    <th className="p-4 font-medium text-gray-500">{t("externalSku")}</th>
                    <th className="p-4 font-medium text-gray-500">{t("externalPrice")}</th>
                    <th className="p-4 font-medium text-gray-500 text-right">{tCommon("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedProducts.map((lp) => (
                    <tr key={lp.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{lp.product?.name || "-"}</td>
                      <td className="p-4 text-gray-600 font-mono text-sm">{lp.supplierSku}</td>
                      <td className="p-4">{Number(lp.supplierPrice).toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleUnlinkProduct(lp.productId)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title={t("unlinkProduct")}
                        >
                          <Unlink size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {linkedProducts.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">
                        {t("noLinkedProducts")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-medium text-gray-500">{tCommon("id")}</th>
                  <th className="p-4 font-medium text-gray-500">{t("externalOrderId")}</th>
                  <th className="p-4 font-medium text-gray-500">{tCommon("status")}</th>
                  <th className="p-4 font-medium text-gray-500">{t("trackingNumber")}</th>
                  <th className="p-4 font-medium text-gray-500">{tCommon("date")}</th>
                  <th className="p-4 font-medium text-gray-500 text-right">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((ord) => (
                  <tr key={ord.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">#{ord.id}</td>
                    <td className="p-4 text-gray-600">{ord.externalOrderId || "-"}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          ORDER_STATUS_COLORS[ord.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm">{ord.trackingNumber || "-"}</td>
                    <td className="p-4 text-gray-600">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {(ord.status === "PENDING" || ord.status === "SENT_TO_SUPPLIER" || ord.status === "CONFIRMED") && (
                        <button
                          onClick={() => handleFulfill(ord.id)}
                          disabled={fulfillingId === ord.id}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm"
                          title={t("fulfillOrder")}
                        >
                          {fulfillingId === ord.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Truck size={16} />
                          )}
                          {t("fulfillOrder")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      {t("noSupplierOrders")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "import" && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">{t("importProducts")}</h2>
          <p className="text-gray-600 mb-4">
            {supplier.apiType === "MANUAL"
              ? "Manual suppliers require a product list. Use the Link Product form above to add products."
              : "Import products from the supplier catalog. Results will appear below."}
          </p>
          <button
            onClick={handleImport}
            disabled={importLoading}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {importLoading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {importLoading ? tCommon("loading") : t("importProducts")}
          </button>
          {importResult && (
            <div
              className={`mt-4 p-4 rounded-lg border ${
                importResult.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {importResult.success ? (importResult.message || t("importSuccess")) : importResult.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
