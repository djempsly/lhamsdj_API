"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Receipt, Plus, Pencil, Trash2, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type TaxRule = {
  id: number;
  country: string;
  state: string;
  taxRate: number;
  name: string;
  isActive: boolean;
};

export default function AdminTaxRulesPage() {
  const t = useTranslations("admin");
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TaxRule | null>(null);
  const [form, setForm] = useState({ country: "", state: "", taxRate: 0, name: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/analytics/tax/rules`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setRules(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ country: "", state: "", taxRate: 0, name: "" });
    setShowForm(true);
  };

  const openEdit = (r: TaxRule) => {
    setEditing(r);
    setForm({ country: r.country, state: r.state, taxRate: r.taxRate, name: r.name });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `${API_URL}/analytics/tax/rules/${editing.id}` : `${API_URL}/analytics/tax/rules`;
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, taxRate: Number(form.taxRate) }),
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
    if (!confirm("Delete this tax rule?")) return;
    try {
      const res = await fetch(`${API_URL}/analytics/tax/rules/${id}`, {
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
          <Receipt className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Tax Rules</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
          <Plus size={18} /> Add Tax Rule
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editing ? "Edit Tax Rule" : "New Tax Rule"}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Country</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full border rounded-lg px-3 py-2" required placeholder="US" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">State / Region</label>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="CA" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required placeholder="State Sales Tax" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Country</th>
              <th className="p-4 font-medium text-gray-500">State</th>
              <th className="p-4 font-medium text-gray-500">Tax Rate</th>
              <th className="p-4 font-medium text-gray-500">Name</th>
              <th className="p-4 font-medium text-gray-500">Active</th>
              <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>}
            {!loading && rules.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{r.country}</td>
                <td className="p-4 text-sm">{r.state || "—"}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{r.taxRate}%</span>
                </td>
                <td className="p-4 text-sm">{r.name}</td>
                <td className="p-4">
                  <span className={r.isActive ? "text-green-600 font-medium" : "text-gray-400"}>{r.isActive ? "Yes" : "No"}</span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEdit(r)} className="p-2 hover:bg-gray-100 rounded"><Pencil size={18} /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {!loading && rules.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No tax rules configured</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
