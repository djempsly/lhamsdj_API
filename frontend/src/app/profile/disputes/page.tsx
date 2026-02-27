"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Plus, Send, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Dispute = {
  id: number;
  orderId: number;
  type: string;
  status: string;
  description: string;
  resolution?: string;
  createdAt: string;
  messages: { id: number; message: string; isAdmin: boolean; createdAt: string }[];
};

type Order = {
  id: number;
  total: number;
  status: string;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_REVIEW: "In Review",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
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

export default function UserDisputesPage() {
  const t = useTranslations("profile");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [form, setForm] = useState({ orderId: "", type: "REFUND", description: "" });
  const [newMessage, setNewMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [disputesRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/disputes/mine`, { credentials: "include" }),
        fetch(`${API_URL}/orders/mine`, { credentials: "include" }),
      ]);
      const [disputesData, ordersData] = await Promise.all([disputesRes.json(), ordersRes.json()]);
      if (disputesData.success) setDisputes(Array.isArray(disputesData.data) ? disputesData.data : []);
      if (ordersData.success) setOrders(Array.isArray(ordersData.data) ? ordersData.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderId: Number(form.orderId), type: form.type, description: form.description }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ orderId: "", type: "REFUND", description: "" });
        load();
      } else {
        alert(data.message || "Error filing dispute");
      }
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleSendMessage = async () => {
    if (!selectedDispute || !newMessage.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/disputes/${selectedDispute.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: newMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        load();
        const updated = await fetch(`${API_URL}/disputes/${selectedDispute.id}`, { credentials: "include" });
        const updatedData = await updated.json();
        if (updatedData.success) setSelectedDispute(updatedData.data);
      }
    } catch { /* empty */ }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-gray-500 hover:text-black">
            <ArrowLeft />
          </Link>
          <h1 className="text-2xl font-bold">My Disputes</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
          <Plus size={18} /> File Dispute
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">File a Dispute</h2>
            <button type="button" onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Select Order</label>
              <select value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} className="w-full border rounded-lg px-3 py-2" required>
                <option value="">Choose an order...</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>Order #{o.id} — ${o.total} ({new Date(o.createdAt).toLocaleDateString()})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Dispute Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="REFUND">Refund Request</option>
                <option value="DAMAGED">Damaged Item</option>
                <option value="NOT_RECEIVED">Not Received</option>
                <option value="WRONG_ITEM">Wrong Item</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full border rounded-lg px-3 py-2 resize-none" required placeholder="Describe your issue in detail..." />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50">{saving ? "Submitting..." : "Submit Dispute"}</button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {disputes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="mx-auto mb-3 text-gray-300" size={48} />
            <p>No disputes filed yet</p>
          </div>
        ) : (
          disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold">Dispute #{d.id}</h3>
                  <p className="text-sm text-gray-500">Order #{d.orderId} — {new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">{d.type.replace("_", " ")}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${statusColor(d.status)}`}>{STATUS_LABELS[d.status] || d.status}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{d.description}</p>
              {d.resolution && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-green-800 mb-1">Resolution</p>
                  <p className="text-sm text-green-700">{d.resolution}</p>
                </div>
              )}
              <button onClick={() => setSelectedDispute(d)} className="text-sm text-blue-600 hover:underline">
                View messages ({d.messages?.length ?? 0})
              </button>
            </div>
          ))
        )}
      </div>

      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="font-bold">Dispute #{selectedDispute.id}</h2>
              <button onClick={() => setSelectedDispute(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {selectedDispute.messages?.map((m) => (
                <div key={m.id} className={`p-3 rounded-lg text-sm ${m.isAdmin ? "bg-black text-white ml-8" : "bg-gray-100 mr-8"}`}>
                  <p className={`text-xs mb-1 ${m.isAdmin ? "text-gray-400" : "text-gray-500"}`}>
                    {m.isAdmin ? "Support" : "You"} — {new Date(m.createdAt).toLocaleString()}
                  </p>
                  <p>{m.message}</p>
                </div>
              ))}
              {(!selectedDispute.messages || selectedDispute.messages.length === 0) && (
                <p className="text-center text-gray-400 py-4">No messages yet</p>
              )}
            </div>

            {selectedDispute.status !== "CLOSED" && (
              <div className="p-4 border-t flex gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={saving || !newMessage.trim()}
                  className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
