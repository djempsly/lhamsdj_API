"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUnread() {
    try {
      const res = await fetch(`${API_URL}/notifications/unread-count`, { credentials: "include" });
      const json = await res.json();
      if (json.success) setUnread(json.data.count);
    } catch {}
  }

  async function loadNotifications() {
    try {
      const res = await fetch(`${API_URL}/notifications`, { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (json.success) setNotifications(json.data);
    } catch {}
  }

  async function markAllRead() {
    try {
      await fetch(`${API_URL}/notifications/read-all`, { method: "PATCH", credentials: "include" });
      setUnread(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  }

  function handleOpen() {
    setOpen(!open);
    if (!open) loadNotifications();
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen} className="relative p-2 text-gray-600 hover:text-black transition">
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Notificaciones</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Marcar todo leído</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center py-8 text-sm text-gray-400">Sin notificaciones</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div key={n.id} className={`px-4 py-3 border-b last:border-0 ${!n.isRead ? "bg-blue-50" : ""}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
