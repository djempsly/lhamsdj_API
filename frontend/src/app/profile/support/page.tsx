"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, HelpCircle, Plus, Send, X, ChevronRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Ticket = {
  id: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  responses: { id: number; message: string; isAdmin: boolean; createdAt: string; user: { name: string } }[];
};

const priorityColor = (p: string) => {
  switch (p) {
    case "URGENT": return "bg-red-100 text-red-800";
    case "HIGH": return "bg-orange-100 text-orange-800";
    case "MEDIUM": return "bg-yellow-100 text-yellow-800";
    case "LOW": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-600";
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "OPEN": return "bg-blue-100 text-blue-800";
    case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800";
    case "RESOLVED": return "bg-green-100 text-green-800";
    case "CLOSED": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-600";
  }
};

export default function UserSupportPage() {
  const t = useTranslations("profile");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ subject: "", description: "", priority: "MEDIUM" });
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tickets/mine`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setTickets(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setForm({ subject: "", description: "", priority: "MEDIUM" });
        load();
      } else {
        alert(data.message || "Error creating ticket");
      }
    } catch { /* empty */ }
    setSaving(false);
  };

  const handleReply = async () => {
    if (!selectedTicket || !reply.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/tickets/${selectedTicket.id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (data.success) {
        setReply("");
        load();
        const updated = await fetch(`${API_URL}/tickets/${selectedTicket.id}`, { credentials: "include" });
        const updatedData = await updated.json();
        if (updatedData.success) setSelectedTicket(updatedData.data);
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
          <h1 className="text-2xl font-bold">Support</h1>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
          <Plus size={18} /> New Ticket
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Create Support Ticket</h2>
            <button type="button" onClick={() => setShowCreate(false)} className="p-1 hover:bg-gray-100 rounded"><X size={18} /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Subject</label>
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full border rounded-lg px-3 py-2 resize-none" required placeholder="Describe your issue..." />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50">{saving ? "Creating..." : "Submit Ticket"}</button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HelpCircle className="mx-auto mb-3 text-gray-300" size={48} />
            <p>No support tickets</p>
            <p className="text-sm mt-1">Create a ticket if you need help</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className="w-full text-left bg-white rounded-xl border p-6 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold">{ticket.subject}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColor(ticket.status)}`}>{ticket.status}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1">{ticket.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(ticket.createdAt).toLocaleDateString()} — {ticket.responses?.length ?? 0} responses
                </p>
              </div>
              <ChevronRight className="text-gray-400 shrink-0" size={20} />
            </button>
          ))
        )}
      </div>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="font-bold">{selectedTicket.subject}</h2>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 text-sm mr-8">
                <p className="text-xs text-gray-500 mb-1">You — {new Date(selectedTicket.createdAt).toLocaleString()}</p>
                <p>{selectedTicket.description}</p>
              </div>

              {selectedTicket.responses?.map((r) => (
                <div key={r.id} className={`p-3 rounded-lg text-sm ${r.isAdmin ? "bg-black text-white ml-8" : "bg-gray-50 mr-8"}`}>
                  <p className={`text-xs mb-1 ${r.isAdmin ? "text-gray-400" : "text-gray-500"}`}>
                    {r.user.name} {r.isAdmin && "(Support)"} — {new Date(r.createdAt).toLocaleString()}
                  </p>
                  <p>{r.message}</p>
                </div>
              ))}
            </div>

            {selectedTicket.status !== "CLOSED" && (
              <div className="p-4 border-t flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleReply()}
                />
                <button onClick={handleReply} disabled={saving || !reply.trim()} className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50">
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
