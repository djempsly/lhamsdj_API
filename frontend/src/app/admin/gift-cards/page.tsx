"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Gift, Plus, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type GiftCard = {
  id: number;
  code: string;
  initialValue: number;
  balance: number;
  status: string;
  expiresAt?: string;
  createdAt: string;
  buyer?: { name: string; email: string };
};

const statusColor = (s: string) => {
  switch (s) {
    case "ACTIVE": return "bg-green-100 text-green-800";
    case "REDEEMED": return "bg-blue-100 text-blue-800";
    case "EXPIRED": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-600";
  }
};

export default function AdminGiftCardsPage() {
  const t = useTranslations("admin");
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ value: 25, recipientEmail: "", expiresAt: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/marketplace/gift-cards/admin`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setCards(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/marketplace/gift-cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          value: Number(form.value),
          recipientEmail: form.recipientEmail || undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ value: 25, recipientEmail: "", expiresAt: "" });
        load();
      } else {
        alert(data.message || "Error creating gift card");
      }
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Gift className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Gift Cards</h1>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <Plus size={18} /> Create Gift Card
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">New Gift Card</h2>
            <button type="button" onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Value ($)</label>
              <input
                type="number"
                min="1"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Recipient Email</label>
              <input
                type="email"
                value={form.recipientEmail}
                onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Expiration Date</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
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
              <th className="p-4 font-medium text-gray-500">Code</th>
              <th className="p-4 font-medium text-gray-500">Initial Value</th>
              <th className="p-4 font-medium text-gray-500">Balance</th>
              <th className="p-4 font-medium text-gray-500">Buyer</th>
              <th className="p-4 font-medium text-gray-500">Status</th>
              <th className="p-4 font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>}
            {!loading && cards.map((card) => (
              <tr key={card.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono font-medium text-sm">{card.code}</td>
                <td className="p-4 font-bold">${card.initialValue.toFixed(2)}</td>
                <td className="p-4 font-bold text-green-700">${card.balance.toFixed(2)}</td>
                <td className="p-4">
                  {card.buyer ? (
                    <div>
                      <p className="text-sm font-medium">{card.buyer.name}</p>
                      <p className="text-xs text-gray-500">{card.buyer.email}</p>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">—</span>
                  )}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor(card.status)}`}>
                    {card.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(card.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!loading && cards.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No gift cards</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
