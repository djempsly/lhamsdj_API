"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, X, Send, ChevronDown, ChevronUp } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Ticket = {
  id: number;
  subject: string;
  description: string;
  priority: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  responses: { id: number; message: string; isAdmin: boolean; createdAt: string; user: { name: string } }[];
};

const priorityColor = (p: string) => {
  switch (p) {
    case "URGENT": return "bg-red-100 text-red-800 border-red-200";
    case "HIGH": return "bg-orange-100 text-orange-800 border-orange-200";
    case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "LOW": return "bg-green-100 text-green-800 border-green-200";
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

export default function AdminTicketsPage() {
  const t = useTranslations("admin");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tickets/admin/all`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setTickets(Array.isArray(data.data) ? data.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReply = async (ticketId: number) => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/tickets/${ticketId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (data.success) {
        setReply("");
        load();
      }
    } catch { /* empty */ }
    setSending(false);
  };

  const handleStatusChange = async (ticketId: number, status: string) => {
    try {
      await fetch(`${API_URL}/tickets/${ticketId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      load();
    } catch { /* empty */ }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <span className="ml-2 px-2 py-1 bg-gray-100 rounded-full text-sm font-medium">
          {tickets.length} total
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">ID</th>
              <th className="p-4 font-medium text-gray-500">Subject</th>
              <th className="p-4 font-medium text-gray-500">User</th>
              <th className="p-4 font-medium text-gray-500">Priority</th>
              <th className="p-4 font-medium text-gray-500">Status</th>
              <th className="p-4 font-medium text-gray-500">Responses</th>
              <th className="p-4 font-medium text-gray-500">Date</th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-8 text-center">Loading...</td></tr>}
            {!loading && tickets.map((ticket) => (
              <>
                <tr key={ticket.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => { setExpanded(expanded === ticket.id ? null : ticket.id); setReply(""); }}>
                  <td className="p-4 font-mono text-sm">#{ticket.id}</td>
                  <td className="p-4 font-medium text-sm">{ticket.subject}</td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{ticket.user.name}</p>
                    <p className="text-xs text-gray-500">{ticket.user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded border text-xs font-bold ${priorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={ticket.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-bold border-0 cursor-pointer ${statusColor(ticket.status)}`}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{ticket.responses?.length ?? 0}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    {expanded === ticket.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </td>
                </tr>
                {expanded === ticket.id && (
                  <tr key={`detail-${ticket.id}`}>
                    <td colSpan={8} className="p-0">
                      <div className="bg-gray-50 p-6 border-b">
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">Description</p>
                          <p className="text-sm bg-white rounded-lg p-3 border">{ticket.description}</p>
                        </div>

                        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                          {ticket.responses?.map((r) => (
                            <div key={r.id} className={`p-3 rounded-lg text-sm ${r.isAdmin ? "bg-black text-white ml-8" : "bg-white border mr-8"}`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-xs">{r.user.name} {r.isAdmin && "(Admin)"}</span>
                                <span className={`text-xs ${r.isAdmin ? "text-gray-400" : "text-gray-500"}`}>
                                  {new Date(r.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <p>{r.message}</p>
                            </div>
                          ))}
                          {(!ticket.responses || ticket.responses.length === 0) && (
                            <p className="text-sm text-gray-400 text-center py-2">No responses yet</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Type your reply..."
                            className="flex-1 border rounded-lg px-3 py-2 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleReply(ticket.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReply(ticket.id); }}
                            disabled={sending || !reply.trim()}
                            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                          >
                            <Send size={16} /> Reply
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {!loading && tickets.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-gray-500">No support tickets</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
