"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Receipt, Plus, Pencil, Trash2, X } from "lucide-react";
import { getTaxRules, createTaxRule, updateTaxRule, deleteTaxRule } from "@/services/analyticsAdminService";

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
  const tc = useTranslations("common");
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TaxRule | null>(null);
  const [form, setForm] = useState({ country: "", state: "", taxRate: 0, name: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTaxRules();
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
      const payload = { ...form, taxRate: Number(form.taxRate) };
      const data = editing
        ? await updateTaxRule(editing.id, payload)
        : await createTaxRule(payload);
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
    if (!confirm(t("deleteTaxRuleConfirm"))) return;
    try {
      const data = await deleteTaxRule(id);
      if (data.success) load();
    } catch { /* empty */ }
  };

  const handleToggleActive = async (r: TaxRule) => {
    await updateTaxRule(r.id, { isActive: !r.isActive });
    load();
  };

  return (
    <div>
      <div
        className="flex justify-between items-center mb-8 p-6 rounded-xl text-white"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
      >
        <div className="flex items-center gap-3">
          <Receipt className="w-8 h-8" />
          <h1 className="text-3xl font-bold">{t("taxRulesTitle")}</h1>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
          <Plus size={18} /> {t("addTaxRule")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 mb-6" style={{ border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 2px 8px rgba(139,92,246,0.1)" }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">{editing ? tc("edit") : tc("create")}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("taxCountry")}</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full border rounded-lg px-3 py-2" required placeholder="US" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("taxState")}</label>
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="CA" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("taxRate")}</label>
              <input type="number" min="0" max="100" step="0.01" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("taxRuleName")}</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2" required placeholder="State Sales Tax" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 text-white rounded-lg disabled:opacity-50" style={{ background: "#8b5cf6" }}>
              {saving ? tc("loading") : editing ? tc("save") : tc("create")}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">{tc("cancel")}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl overflow-hidden" style={{ border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 2px 8px rgba(139,92,246,0.1)" }}>
        <table className="w-full text-left">
          <thead className="border-b" style={{ background: "rgba(139,92,246,0.04)" }}>
            <tr>
              <th className="p-4 font-medium text-gray-500">{t("taxCountry")}</th>
              <th className="p-4 font-medium text-gray-500">{t("taxState")}</th>
              <th className="p-4 font-medium text-gray-500">{t("taxRate")}</th>
              <th className="p-4 font-medium text-gray-500">{tc("name")}</th>
              <th className="p-4 font-medium text-gray-500">{tc("status")}</th>
              <th className="p-4 font-medium text-gray-500 text-right">{tc("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center">{tc("loading")}</td></tr>}
            {!loading && rules.map((r) => (
              <tr key={r.id} className="border-b hover:bg-purple-50/30">
                <td className="p-4 font-medium">{r.country}</td>
                <td className="p-4 text-sm">{r.state || "—"}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-bold">{r.taxRate}%</span>
                </td>
                <td className="p-4 text-sm">{r.name}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleActive(r)}
                    className={`text-sm font-medium px-2 py-0.5 rounded ${r.isActive ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-50"}`}
                  >
                    {r.isActive ? tc("active") : tc("inactive")}
                  </button>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEdit(r)} className="p-2 hover:bg-purple-50 rounded text-purple-600"><Pencil size={18} /></button>
                  <button onClick={() => handleDelete(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
            {!loading && rules.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">{t("noTaxRules")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
