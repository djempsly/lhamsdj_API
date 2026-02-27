"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, X, Search } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Dispute = {
  id: number;
  orderId: number;
  type: string;
  status: string;
  description: string;
  resolution?: string;
  createdAt: string;
  user: { name: string; email: string };
};

const STATUS_OPTIONS = ["OPEN", "IN_REVIEW", "RESOLVED", "CLOSED"] as const;
const TYPE_LABELS: Record<string, string> = {
  REFUND: "Refund",
  DAMAGED: "Damaged",
  NOT_RECEIVED: "Not Received",
  WRONG_ITEM: "Wrong Item",
  OTHER: "Other",
};

const statusColor = (s: string) => {
  switch (s) {
    case "OPEN": return "bg-red-100 text-red-800";
    case "IN_REVIEW": return "bg-yellow-100 text-yellow-800";
    case "RESOLVED": return "bg-green-100 text-green-800";
    case "CLOSED": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-600";
  }
};

export default function AdminDisputesPage() {
  const t = useTranslations("admin");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [resolution, setResolution] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/disputes/admin/all`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setDisputes(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "ALL" ? disputes : disputes.filter((d) => d.status === filter);

  const handleUpdate = async () => {
    if (!selected || !newStatus) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/disputes/${selected.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus, resolution }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(null);
        setNewStatus("");
        setResolution("");
        load();
      }
    } catch { /* empty */ }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <AlertTriangle className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Disputes</h1>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["ALL", ...STATUS_OPTIONS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s ? "bg-black text-white" : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
            {s !== "ALL" && (
              <span className="ml-2 text-xs opacity-70">
                ({disputes.filter((d) => d.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">ID</th>
              <th className="p-4 font-medium text-gray-500">Order #</th>
              <th className="p-4 font-medium text-gray-500">Customer</th>
              <th className="p-4 font-medium text-gray-500">Type</th>
              <th className="p-4 font-medium text-gray-500">Status</th>
              <th className="p-4 font-medium text-gray-500">Date</th>
              <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && filtered.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono text-sm">#{d.id}</td>
                <td className="p-4 font-mono text-sm">#{d.orderId}</td>
                <td className="p-4">
                  <p className="font-bold text-sm">{d.user.name}</p>
                  <p className="text-xs text-gray-500">{d.user.email}</p>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {TYPE_LABELS[d.type] || d.type}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor(d.status)}`}>
                    {d.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(d.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => { setSelected(d); setNewStatus(d.status); setResolution(d.resolution || ""); }}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">No disputes found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Dispute #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Order</p>
                  <p className="font-medium">#{selected.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">{TYPE_LABELS[selected.type] || selected.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer</p>
                  <p className="font-medium">{selected.user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Filed</p>
                  <p className="font-medium">{new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm mb-1">Description</p>
                <p className="text-sm bg-gray-50 rounded-lg p-3">{selected.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 resize-none"
                  placeholder="Add resolution details..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-1 bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Update Dispute"}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
