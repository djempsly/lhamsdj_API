"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Zap, Plus, Trash2, Power, X, Search } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FlashSale = {
  id: number;
  name: string;
  discount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  items: { id: number; product: { id: number; name: string } }[];
};

type Product = {
  id: number;
  name: string;
};

export default function AdminFlashSalesPage() {
  const t = useTranslations("admin");
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", discount: 10, startDate: "", endDate: "" });
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/marketplace/flash-sales/admin`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setSales(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const searchProducts = async (q: string) => {
    setProductSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setSearchResults(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/marketplace/flash-sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          discount: Number(form.discount),
          productIds: selectedProducts.map((p) => p.id),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ name: "", discount: 10, startDate: "", endDate: "" });
        setSelectedProducts([]);
        load();
      } else {
        alert(data.message || "Error creating flash sale");
      }
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/marketplace/flash-sales/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) load();
    } catch { /* empty */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this flash sale?")) return;
    try {
      const res = await fetch(`${API_URL}/marketplace/flash-sales/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) load();
    } catch { /* empty */ }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Zap className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Flash Sales</h1>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <Plus size={18} /> New Flash Sale
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold mb-4">Create Flash Sale</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Discount (%)</label>
              <input
                type="number"
                min="1"
                max="99"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">Add Products</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={productSearch}
                onChange={(e) => searchProducts(e.target.value)}
                className="w-full border rounded-lg pl-9 pr-3 py-2"
                placeholder="Search products..."
              />
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto bg-white shadow-lg">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      if (!selectedProducts.find((sp) => sp.id === p.id)) {
                        setSelectedProducts([...selectedProducts, p]);
                      }
                      setProductSearch("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProducts.map((p) => (
                  <span key={p.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                    {p.name}
                    <button type="button" onClick={() => setSelectedProducts(selectedProducts.filter((sp) => sp.id !== p.id))}>
                      <X size={14} className="text-gray-500 hover:text-red-500" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50">
              {saving ? "Creating..." : "Create"}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Name</th>
              <th className="p-4 font-medium text-gray-500">Discount</th>
              <th className="p-4 font-medium text-gray-500">Start</th>
              <th className="p-4 font-medium text-gray-500">End</th>
              <th className="p-4 font-medium text-gray-500">Items</th>
              <th className="p-4 font-medium text-gray-500">Active</th>
              <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="p-8 text-center">Loading...</td></tr>}
            {!loading && sales.map((sale) => (
              <tr key={sale.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{sale.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">
                    {sale.discount}% OFF
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{new Date(sale.startDate).toLocaleDateString()}</td>
                <td className="p-4 text-sm text-gray-500">{new Date(sale.endDate).toLocaleDateString()}</td>
                <td className="p-4 text-sm">{sale.items?.length ?? 0} products</td>
                <td className="p-4">
                  <span className={sale.isActive ? "text-green-600 font-medium" : "text-gray-400"}>
                    {sale.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleToggle(sale.id)} className="p-2 hover:bg-gray-100 rounded" title="Toggle">
                    <Power size={18} />
                  </button>
                  <button onClick={() => handleDelete(sale.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && sales.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No flash sales</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
