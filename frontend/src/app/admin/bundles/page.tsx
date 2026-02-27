"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Boxes, Plus, Trash2, Pencil, X, Search } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Bundle = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  products: { id: number; name: string; price: number }[];
};

type Product = { id: number; name: string; price: number };

export default function AdminBundlesPage() {
  const t = useTranslations("admin");
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", price: 0, discount: 0 });
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/marketplace/bundles`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setBundles(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const searchProductsFn = async (q: string) => {
    setProductSearch(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(q)}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setSearchResults(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", price: 0, discount: 0 });
    setSelectedProducts([]);
    setShowForm(true);
  };

  const openEdit = (b: Bundle) => {
    setEditing(b);
    setForm({ name: b.name, slug: b.slug, description: b.description, price: b.price, discount: b.discount });
    setSelectedProducts(b.products || []);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      price: Number(form.price),
      discount: Number(form.discount),
      productIds: selectedProducts.map((p) => p.id),
    };
    try {
      const url = editing ? `${API_URL}/marketplace/bundles/${editing.id}` : `${API_URL}/marketplace/bundles`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        load();
      } else {
        alert(data.message || "Error");
      }
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this bundle?")) return;
    try {
      const res = await fetch(`${API_URL}/marketplace/bundles/${id}`, {
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
          <Boxes className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Bundles</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
          <Plus size={18} /> New Bundle
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editing ? "Edit Bundle" : "Create Bundle"}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 resize-none" rows={2} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price ($)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Discount (%)</label>
              <input type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">Products</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={productSearch} onChange={(e) => searchProductsFn(e.target.value)} className="w-full border rounded-lg pl-9 pr-3 py-2" placeholder="Search products..." />
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-lg mt-1 max-h-40 overflow-y-auto bg-white shadow-lg">
                {searchResults.map((p) => (
                  <button key={p.id} type="button" onClick={() => { if (!selectedProducts.find((sp) => sp.id === p.id)) setSelectedProducts([...selectedProducts, p]); setProductSearch(""); setSearchResults([]); }} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">
                    {p.name} — ${p.price}
                  </button>
                ))}
              </div>
            )}
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedProducts.map((p) => (
                  <span key={p.id} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                    {p.name}
                    <button type="button" onClick={() => setSelectedProducts(selectedProducts.filter((sp) => sp.id !== p.id))}><X size={14} className="text-gray-500 hover:text-red-500" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <p className="col-span-full text-center py-8 text-gray-500">Loading...</p>}
        {!loading && bundles.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-lg">{b.name}</h3>
              <div className="flex gap-1">
                <button onClick={() => openEdit(b)} className="p-1.5 hover:bg-gray-100 rounded"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(b.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{b.description || "No description"}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl font-bold">${b.price}</span>
              {b.discount > 0 && (
                <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-bold">{b.discount}% OFF</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {b.products?.slice(0, 3).map((p) => (
                <span key={p.id} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{p.name}</span>
              ))}
              {(b.products?.length ?? 0) > 3 && (
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-500">+{b.products.length - 3} more</span>
              )}
            </div>
          </div>
        ))}
        {!loading && bundles.length === 0 && (
          <p className="col-span-full text-center py-8 text-gray-500">No bundles created yet</p>
        )}
      </div>
    </div>
  );
}
