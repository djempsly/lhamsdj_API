"use client";

import { useEffect, useState } from "react";
import { Check, X, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
type ToastData = { id: number; message: string; type: ToastType };

let addToast: (message: string, type?: ToastType) => void = () => {};

/** Call from anywhere: showToast("Added to cart!", "success") */
export function showToast(message: string, type: ToastType = "success") {
  addToast(message, type);
}

const ICONS = { success: Check, error: X, warning: AlertTriangle, info: Info };
const THEME: Record<ToastType, { color: string; border: string; shadow: string; bg: string }> = {
  success: { color: "#22c55e", border: "rgba(34,197,94,0.3)", shadow: "0 8px 32px rgba(34,197,94,0.2)", bg: "rgba(34,197,94,0.08)" },
  error: { color: "#ef4444", border: "rgba(239,68,68,0.3)", shadow: "0 8px 32px rgba(239,68,68,0.2)", bg: "rgba(239,68,68,0.08)" },
  warning: { color: "#f59e0b", border: "rgba(245,158,11,0.3)", shadow: "0 8px 32px rgba(245,158,11,0.2)", bg: "rgba(245,158,11,0.08)" },
  info: { color: "#8b5cf6", border: "rgba(139,92,246,0.3)", shadow: "0 8px 32px rgba(139,92,246,0.2)", bg: "rgba(139,92,246,0.08)" },
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    addToast = (message: string, type: ToastType = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    return () => { addToast = () => {}; };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        const theme = THEME[toast.type];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 bg-white px-4 py-3 min-w-[280px] max-w-[380px] animate-[slideIn_300ms_ease-out]"
            style={{ borderRadius: 12, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: theme.bg }}>
              <Icon size={16} style={{ color: theme.color }} />
            </div>
            <span className="text-sm font-medium text-gray-800 flex-1">{toast.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={14} /></button>
          </div>
        );
      })}
      <style jsx>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}
