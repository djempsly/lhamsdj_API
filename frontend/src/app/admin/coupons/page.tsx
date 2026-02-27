"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getCoupons, createCoupon, toggleCoupon, deleteCoupon } from "@/services/adminService";
import { Tag, Plus, Trash2, Power } from "lucide-react";

export default function AdminCouponsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "PERCENTAGE", value: 10, minPurchase: "", maxUses: "", expiresAt: "" });

  const load = async () => {
    setLoading(true);
    const res = await getCoupons();
    if (res.success) setCoupons(Array.isArray(res.data) ? res.data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createCoupon({
      code: form.code.trim(),
      type: form.type,
      value: Number(form.value),
      minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      expiresAt: form.expiresAt || undefined,
    });
    if (res.success) {
      setShowForm(false);
      setForm({ code: "", type: "PERCENTAGE", value: 10, minPurchase: "", maxUses: "", expiresAt: "" });
      load();
    } else {
      alert(res.message || t("couponError"));
    }
  };

  const handleToggle = async (id: number) => {
    const res = await toggleCoupon(id);
    if (res.success) load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteCoupon"))) return;
    const res = await deleteCoupon(id);
    if (res.success) load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("coupons")}</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
          <Plus size={18} /> {t("newCoupon")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold mb-4">{t("createCoupon")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("code")}</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("type")}</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="PERCENTAGE">{t("percentage")}</option>
                <option value="FIXED">{t("fixedAmount")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("value")} {form.type === "PERCENTAGE" ? "(%)" : "($)"}</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("minPurchase")}</label>
              <input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("maxUses")}</label>
              <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">{t("validUntil")}</label>
              <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg">{tCommon("create")}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">{tCommon("cancel")}</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">{t("code")}</th>
              <th className="p-4 font-medium text-gray-500">{t("type")}</th>
              <th className="p-4 font-medium text-gray-500">{t("value")}</th>
              <th className="p-4 font-medium text-gray-500">{t("uses")}</th>
              <th className="p-4 font-medium text-gray-500">{tCommon("active")}</th>
              <th className="p-4 font-medium text-gray-500 text-right">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center">{tCommon("loading")}</td></tr>}
            {!loading && coupons.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono font-medium">{c.code}</td>
                <td className="p-4">{c.type}</td>
                <td className="p-4">{c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`}</td>
                <td className="p-4">{c.usedCount ?? 0}</td>
                <td className="p-4">
                  <span className={c.isActive ? "text-green-600" : "text-gray-400"}>{c.isActive ? tCommon("yes") : tCommon("no")}</span>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => handleToggle(c.id)} className="p-2 hover:bg-gray-100 rounded" title={c.isActive ? t("deactivate") : t("activate")}>
                    <Power size={18} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && coupons.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500">{t("noCoupons")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
