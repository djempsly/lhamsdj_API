"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  getSuppliers, createSupplier, updateSupplier,
  getAdapterTypes, testSupplierConnection,
} from "@/services/adminService";
import Link from "next/link";
import { Plus, Pencil, Wifi, WifiOff, X, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  apiType: string;
  apiBaseUrl: string | null;
  apiKey: string | null;
  webhookSecret: string | null;
  contactEmail: string | null;
  country: string;
  currency: string;
  leadTimeDays: number;
  status: string;
  notes: string | null;
  _count?: { products: number; orders: number };
}

interface AdapterType {
  value: string;
  label: string;
  requiresUrl: boolean;
  requiresConfig?: boolean;
}

const EMPTY_CONFIG = {
  authType: "bearer" as const,
  authHeaderName: "",
  authPrefix: "Bearer",
  authQueryParam: "",
  customHeaders: "",
  endpoints: {
    getProduct: { method: "GET", path: "/products/{sku}", bodyTemplate: "" },
    placeOrder: { method: "POST", path: "/orders", bodyTemplate: "" },
    getOrderStatus: { method: "GET", path: "/orders/{orderId}" },
  },
  responseMapping: {
    product: { sku: "data.sku", name: "data.name", price: "data.price", stock: "data.stock", image: "data.image" },
    order: { orderId: "data.order_id", status: "data.status", tracking: "data.tracking_number" },
    orderStatus: { status: "data.status", tracking: "data.tracking_number" },
  },
};

const EMPTY_FORM = {
  name: "", apiType: "MANUAL", apiBaseUrl: "", apiKey: "",
  webhookSecret: "", contactEmail: "", country: "",
  currency: "USD", leadTimeDays: 7, notes: "", status: "ACTIVE",
  apiConfig: EMPTY_CONFIG,
};

export default function AdminSuppliersPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [adapterTypes, setAdapterTypes] = useState<AdapterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [testResult, setTestResult] = useState<{ id: number; ok: boolean; msg: string } | null>(null);
  const [showKeys, setShowKeys] = useState(false);

  const load = async () => {
    setLoading(true);
    const [suppRes, typesRes] = await Promise.all([getSuppliers(), getAdapterTypes()]);
    if (suppRes.success) setSuppliers(Array.isArray(suppRes.data) ? suppRes.data : []);
    if (typesRes.success) setAdapterTypes(typesRes.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowModal(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      name: s.name, apiType: s.apiType, apiBaseUrl: s.apiBaseUrl || "",
      apiKey: s.apiKey || "", webhookSecret: s.webhookSecret || "",
      contactEmail: s.contactEmail || "", country: s.country,
      currency: s.currency, leadTimeDays: s.leadTimeDays,
      notes: s.notes || "", status: s.status,
      apiConfig: (s as any).apiConfig || EMPTY_CONFIG,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.country) { setError("Name and country are required"); return; }
    setSaving(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        name: form.name, apiType: form.apiType, country: form.country,
        currency: form.currency, leadTimeDays: form.leadTimeDays,
        notes: form.notes || undefined, status: form.status,
        contactEmail: form.contactEmail || undefined,
      };
      if (form.apiBaseUrl) body.apiBaseUrl = form.apiBaseUrl;
      if (form.apiKey) body.apiKey = form.apiKey;
      if (form.webhookSecret) body.webhookSecret = form.webhookSecret;

      if (form.apiType === "CUSTOM_API") {
        const cfg = form.apiConfig;
        let customHeaders: Record<string, string> | undefined;
        if (cfg.customHeaders && typeof cfg.customHeaders === "string" && cfg.customHeaders.trim()) {
          try { customHeaders = JSON.parse(cfg.customHeaders); } catch { setError("Custom headers must be valid JSON"); setSaving(false); return; }
        }
        let getProductBody: Record<string, unknown> | undefined;
        if (cfg.endpoints.getProduct.bodyTemplate && typeof cfg.endpoints.getProduct.bodyTemplate === "string" && cfg.endpoints.getProduct.bodyTemplate.trim()) {
          try { getProductBody = JSON.parse(cfg.endpoints.getProduct.bodyTemplate); } catch { setError("Get Product body template must be valid JSON"); setSaving(false); return; }
        }
        let placeOrderBody: Record<string, unknown> | undefined;
        if (cfg.endpoints.placeOrder.bodyTemplate && typeof cfg.endpoints.placeOrder.bodyTemplate === "string" && cfg.endpoints.placeOrder.bodyTemplate.trim()) {
          try { placeOrderBody = JSON.parse(cfg.endpoints.placeOrder.bodyTemplate); } catch { setError("Place Order body template must be valid JSON"); setSaving(false); return; }
        }

        body.apiConfig = {
          adapterName: form.name,
          authType: cfg.authType,
          authHeaderName: cfg.authHeaderName || undefined,
          authPrefix: cfg.authPrefix || undefined,
          authQueryParam: cfg.authQueryParam || undefined,
          customHeaders: customHeaders || undefined,
          endpoints: {
            getProduct: { method: cfg.endpoints.getProduct.method, path: cfg.endpoints.getProduct.path, bodyTemplate: getProductBody },
            placeOrder: { method: cfg.endpoints.placeOrder.method, path: cfg.endpoints.placeOrder.path, bodyTemplate: placeOrderBody },
            getOrderStatus: { method: cfg.endpoints.getOrderStatus.method, path: cfg.endpoints.getOrderStatus.path },
          },
          responseMapping: cfg.responseMapping,
        };
      }

      const res = editing ? await updateSupplier(editing.id, body) : await createSupplier(body);

      if (res.success) {
        setShowModal(false);
        load();
      } else {
        setError(res.message || "Error");
      }
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (id: number) => {
    setTestResult({ id, ok: false, msg: "Testing..." });
    const res = await testSupplierConnection(id);
    if (res.success && res.data?.connected) {
      setTestResult({ id, ok: true, msg: `Connected (${res.data.latencyMs}ms)` });
    } else {
      setTestResult({ id, ok: false, msg: res.data?.error || "Connection failed" });
    }
    setTimeout(() => setTestResult(null), 5000);
  };

  const selectedAdapter = adapterTypes.find(a => a.value === form.apiType);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("suppliersDropshipping")}</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
          <Plus size={18} /> {t("addSupplier")}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">{tCommon("name")}</th>
              <th className="p-4 font-medium text-gray-500">{t("type")}</th>
              <th className="p-4 font-medium text-gray-500">{tCommon("status")}</th>
              <th className="p-4 font-medium text-gray-500">{t("linkedProducts")}</th>
              <th className="p-4 font-medium text-gray-500">{t("orders")}</th>
              <th className="p-4 font-medium text-gray-500">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center text-gray-500">{tCommon("loading")}</td></tr>}
            {!loading && suppliers.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <Link href={`/admin/suppliers/${s.id}`} className="font-medium hover:underline text-blue-600">
                    {s.name}
                  </Link>
                  <div className="text-xs text-gray-400">{s.country} &middot; {s.currency}</div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{s.apiType}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${s.status === "ACTIVE" ? "bg-green-100 text-green-800" : s.status === "PAUSED" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-4 text-center">{s._count?.products ?? 0}</td>
                <td className="p-4 text-center">{s._count?.orders ?? 0}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(s)} className="p-2 hover:bg-gray-100 rounded" title="Edit">
                      <Pencil size={16} />
                    </button>
                    {s.apiType !== "MANUAL" && (
                      <button onClick={() => handleTest(s.id)} className="p-2 hover:bg-gray-100 rounded" title="Test">
                        {testResult?.id === s.id ? (
                          testResult.ok ? <CheckCircle size={16} className="text-green-500" /> : <AlertTriangle size={16} className="text-red-500" />
                        ) : <Wifi size={16} />}
                      </button>
                    )}
                  </div>
                  {testResult?.id === s.id && (
                    <p className={`text-xs mt-1 ${testResult.ok ? 'text-green-600' : 'text-red-500'}`}>{testResult.msg}</p>
                  )}
                </td>
              </tr>
            ))}
            {!loading && suppliers.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">{t("noSuppliers")}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">{editing ? t("editSupplier") : t("addSupplier")}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("name")} *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="CJ Dropshipping" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("type")} *</label>
                  <select value={form.apiType} onChange={e => setForm({...form, apiType: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white">
                    {adapterTypes.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
              </div>

              {form.apiType !== "MANUAL" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-blue-800 text-sm">{t("apiConfig")}</h3>

                  {(selectedAdapter?.requiresUrl || form.apiType === "CUSTOM_API") && (
                    <div>
                      <label className="block text-sm text-blue-700 mb-1">API Base URL</label>
                      <input value={form.apiBaseUrl} onChange={e => setForm({...form, apiBaseUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg outline-none" placeholder="https://api.supplier.com/v1" />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-blue-700 mb-1">API Key / Access Token</label>
                    <div className="relative">
                      <input type={showKeys ? "text" : "password"} value={form.apiKey} onChange={e => setForm({...form, apiKey: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-blue-200 rounded-lg outline-none" placeholder="sk_live_..." />
                      <button type="button" onClick={() => setShowKeys(!showKeys)} className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                        {showKeys ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-blue-700 mb-1">Webhook Secret ({t("optional")})</label>
                    <input type={showKeys ? "text" : "password"} value={form.webhookSecret} onChange={e => setForm({...form, webhookSecret: e.target.value})}
                      className="w-full px-3 py-2 border border-blue-200 rounded-lg outline-none" placeholder="whsec_..." />
                    {editing && (
                      <p className="text-xs text-blue-600 mt-1">
                        Webhook URL: <code className="bg-blue-100 px-1 rounded">{BACKEND_URL}/api/v1/suppliers/webhook/{editing.id}</code>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {form.apiType === "CUSTOM_API" && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                  <h3 className="font-semibold text-purple-800 text-sm">Custom API Configuration</h3>

                  {/* Auth */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-purple-700 mb-1">Auth Type</label>
                      <select value={form.apiConfig.authType} onChange={e => setForm({...form, apiConfig: {...form.apiConfig, authType: e.target.value}})}
                        className="w-full px-2 py-1.5 border border-purple-200 rounded text-sm bg-white outline-none">
                        <option value="bearer">Bearer Token</option>
                        <option value="header">Custom Header</option>
                        <option value="query">Query Param</option>
                      </select>
                    </div>
                    {form.apiConfig.authType === "header" && (
                      <div>
                        <label className="block text-xs font-medium text-purple-700 mb-1">Header Name</label>
                        <input value={form.apiConfig.authHeaderName} onChange={e => setForm({...form, apiConfig: {...form.apiConfig, authHeaderName: e.target.value}})}
                          className="w-full px-2 py-1.5 border border-purple-200 rounded text-sm outline-none" placeholder="X-Api-Key" />
                      </div>
                    )}
                    {form.apiConfig.authType === "bearer" && (
                      <div>
                        <label className="block text-xs font-medium text-purple-700 mb-1">Prefix</label>
                        <input value={form.apiConfig.authPrefix} onChange={e => setForm({...form, apiConfig: {...form.apiConfig, authPrefix: e.target.value}})}
                          className="w-full px-2 py-1.5 border border-purple-200 rounded text-sm outline-none" placeholder="Bearer" />
                      </div>
                    )}
                    {form.apiConfig.authType === "query" && (
                      <div>
                        <label className="block text-xs font-medium text-purple-700 mb-1">Query Param</label>
                        <input value={form.apiConfig.authQueryParam} onChange={e => setForm({...form, apiConfig: {...form.apiConfig, authQueryParam: e.target.value}})}
                          className="w-full px-2 py-1.5 border border-purple-200 rounded text-sm outline-none" placeholder="api_key" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-purple-700 mb-1">Custom Headers (JSON, optional)</label>
                    <input value={form.apiConfig.customHeaders} onChange={e => setForm({...form, apiConfig: {...form.apiConfig, customHeaders: e.target.value}})}
                      className="w-full px-2 py-1.5 border border-purple-200 rounded text-sm outline-none font-mono" placeholder='{"X-Custom": "value"}' />
                  </div>

                  {/* Endpoints */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide">Endpoints</h4>

                    <div className="bg-white rounded p-3 border border-purple-100">
                      <p className="text-xs font-semibold text-purple-800 mb-2">Get Product</p>
                      <div className="grid grid-cols-4 gap-2">
                        <select value={form.apiConfig.endpoints.getProduct.method}
                          onChange={e => setForm({...form, apiConfig: {...form.apiConfig, endpoints: {...form.apiConfig.endpoints, getProduct: {...form.apiConfig.endpoints.getProduct, method: e.target.value}}}})}
                          className="px-2 py-1 border rounded text-xs bg-white">
                          <option>GET</option><option>POST</option>
                        </select>
                        <input value={form.apiConfig.endpoints.getProduct.path} className="col-span-3 px-2 py-1 border rounded text-xs font-mono"
                          onChange={e => setForm({...form, apiConfig: {...form.apiConfig, endpoints: {...form.apiConfig.endpoints, getProduct: {...form.apiConfig.endpoints.getProduct, path: e.target.value}}}})}
                          placeholder="/products/{sku}" />
                      </div>
                      {form.apiConfig.endpoints.getProduct.method === "POST" && (
                        <input value={form.apiConfig.endpoints.getProduct.bodyTemplate} className="w-full mt-2 px-2 py-1 border rounded text-xs font-mono"
                          onChange={e => setForm({...form, apiConfig: {...form.apiConfig, endpoints: {...form.apiConfig.endpoints, getProduct: {...form.apiConfig.endpoints.getProduct, bodyTemplate: e.target.value}}}})}
                          placeholder='{"product_id": "{sku}"}' />
                      )}
                    </div>

                    <div className="bg-white rounded p-3 border border-purple-100">
                      <p className="text-xs font-semibold text-purple-800 mb-2">Place Order</p>
                      <div className="grid grid-cols-4 gap-2">
                        <select value={form.apiConfig.endpoints.placeOrder.method}
                          onChange={e => setForm({...form, apiConfig: {...form.apiConfig, endpoints: {...form.apiConfig.endpoints, placeOrder: {...form.apiConfig.endpoints.placeOrder, method: e.target.value}}}})}
                          className="px-2 py-1 border rounded text-xs bg-white">
                          <option>POST</option><option>PUT</option>
                        </select>
                        <input value={form.apiConfig.endpoints.placeOrder.path} className="col-span-3 px-2 py-1 border rounded text-xs font-mono"
                          onChange={e => setForm({...form, apiConfig: {...form.apiConfig, endpoints: {...form.apiConfig.endpoints, placeOrder: {...form.apiConfig.endpoints.placeOrder, path: e.target.value}}}})}
                          placeholder="/orders" />
                      </div>
                      <input value={form.apiConfig.endpoints.placeOrder.bodyTemplate} className="w-full mt-2 px-2 py-1 border rounded text-xs font-mono"
                        onChange={e => setForm({...form, apiConfig: {...form.apiConfig, endpoints: {...form.apiConfig.endpoints, placeOrder: {...form.apiConfig.endpoints.placeOrder, bodyTemplate: e.target.value}}}})}
                        placeholder='{"items": [{"sku": "{sku}", "qty": "{quantity}"}], "address": {"name": "{name}"}}' />
                    </div>

                    <div className="bg-white rounded p-3 border border-purple-100">
                      <p className="text-xs font-semibold text-purple-800 mb-2">Get Order Status</p>
                      <div className="grid grid-cols-4 gap-2">
                        <select value={form.apiConfig.endpoints.getOrderStatus.method}
                          onChange={e => setForm({...form, apiConfig: {...form.apiConfig, endpoints: {...form.apiConfig.endpoints, getOrderStatus: {...form.apiConfig.endpoints.getOrderStatus, method: e.target.value}}}})}
                          className="px-2 py-1 border rounded text-xs bg-white">
                          <option>GET</option><option>POST</option>
                        </select>
                        <input value={form.apiConfig.endpoints.getOrderStatus.path} className="col-span-3 px-2 py-1 border rounded text-xs font-mono"
                          onChange={e => setForm({...form, apiConfig: {...form.apiConfig, endpoints: {...form.apiConfig.endpoints, getOrderStatus: {...form.apiConfig.endpoints.getOrderStatus, path: e.target.value}}}})}
                          placeholder="/orders/{orderId}" />
                      </div>
                    </div>
                  </div>

                  {/* Response Mapping */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wide">Response Field Mapping (JSON paths)</h4>

                    <div className="bg-white rounded p-3 border border-purple-100">
                      <p className="text-xs font-semibold text-purple-800 mb-2">Product Fields</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["sku", "name", "price", "stock", "image"] as const).map(f => (
                          <div key={f}>
                            <label className="text-[10px] text-purple-600 uppercase">{f}</label>
                            <input value={(form.apiConfig.responseMapping.product as any)[f] || ""}
                              onChange={e => setForm({...form, apiConfig: {...form.apiConfig, responseMapping: {...form.apiConfig.responseMapping, product: {...form.apiConfig.responseMapping.product, [f]: e.target.value}}}})}
                              className="w-full px-2 py-1 border rounded text-xs font-mono" placeholder={`data.${f}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded p-3 border border-purple-100">
                      <p className="text-xs font-semibold text-purple-800 mb-2">Order Response Fields</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["orderId", "status", "tracking"] as const).map(f => (
                          <div key={f}>
                            <label className="text-[10px] text-purple-600 uppercase">{f}</label>
                            <input value={(form.apiConfig.responseMapping.order as any)[f] || ""}
                              onChange={e => setForm({...form, apiConfig: {...form.apiConfig, responseMapping: {...form.apiConfig.responseMapping, order: {...form.apiConfig.responseMapping.order, [f]: e.target.value}}}})}
                              className="w-full px-2 py-1 border rounded text-xs font-mono" placeholder={`data.${f}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded p-3 border border-purple-100">
                      <p className="text-xs font-semibold text-purple-800 mb-2">Order Status Fields</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["status", "tracking"] as const).map(f => (
                          <div key={f}>
                            <label className="text-[10px] text-purple-600 uppercase">{f}</label>
                            <input value={(form.apiConfig.responseMapping.orderStatus as any)[f] || ""}
                              onChange={e => setForm({...form, apiConfig: {...form.apiConfig, responseMapping: {...form.apiConfig.responseMapping, orderStatus: {...form.apiConfig.responseMapping.orderStatus, [f]: e.target.value}}}})}
                              className="w-full px-2 py-1 border rounded text-xs font-mono" placeholder={`data.${f}`} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-purple-600">
                    Use <code className="bg-purple-100 px-1 rounded">{"{sku}"}</code>, <code className="bg-purple-100 px-1 rounded">{"{quantity}"}</code>, <code className="bg-purple-100 px-1 rounded">{"{name}"}</code>, <code className="bg-purple-100 px-1 rounded">{"{street}"}</code>, <code className="bg-purple-100 px-1 rounded">{"{city}"}</code>, <code className="bg-purple-100 px-1 rounded">{"{country}"}</code>, <code className="bg-purple-100 px-1 rounded">{"{postalCode}"}</code>, <code className="bg-purple-100 px-1 rounded">{"{orderId}"}</code> as placeholders. Response mapping uses dot notation: <code className="bg-purple-100 px-1 rounded">data.result.id</code>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("country")} *</label>
                  <input value={form.country} onChange={e => setForm({...form, country: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="CN" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("currency")}</label>
                  <input value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="USD" maxLength={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("leadTime")}</label>
                  <input type="number" value={form.leadTimeDays} onChange={e => setForm({...form, leadTimeDays: Number(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" min={1} max={90} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("email")} ({t("optional")})</label>
                  <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none" placeholder="supplier@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tCommon("status")}</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none bg-white">
                    <option value="ACTIVE">{tCommon("active")}</option>
                    <option value="PAUSED">Paused</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("notes")}</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none resize-none" />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100 transition">
                {tCommon("cancel")}
              </button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition flex items-center gap-2">
                {saving && <Loader2 size={16} className="animate-spin" />}
                {tCommon("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
