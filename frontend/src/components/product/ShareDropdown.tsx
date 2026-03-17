"use client";

import { useState, useRef, useEffect } from "react";
import { Link2, MessageCircle, Share2 } from "lucide-react";
import { showToast } from "@/components/shared/Toast";

type Props = { url: string; title: string; onClose?: () => void };

export default function ShareDropdown({ url, title, onClose }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied!", "success");
    } catch {
      showToast("Could not copy link", "error");
    }
    setOpen(false);
  };

  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const items = [
    { label: "Copy link", icon: Link2, onClick: copyLink },
    { label: "WhatsApp", icon: MessageCircle, onClick: () => window.open(`https://wa.me/?text=${encodedTitle}%20${encoded}`, "_blank") },
    { label: "Facebook", icon: Share2, onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, "_blank") },
    { label: "Twitter", icon: Share2, onClick: () => window.open(`https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`, "_blank") },
  ];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 transition-all"
        style={{ border: "0.5px solid #e5e7eb", borderRadius: 8 }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.color = "#8b5cf6"; }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.color = "#4b5563"; } }}
      >
        <Share2 size={13} /> Share
      </button>
      {open && (
        <div
          className="absolute top-full mt-2 right-0 bg-white z-50 py-1 min-w-[160px] animate-[fadeIn_150ms_ease]"
          style={{ borderRadius: 10, border: "1px solid rgba(139,92,246,0.15)", boxShadow: "0 8px 24px rgba(139,92,246,0.12)" }}
        >
          {items.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      )}
      <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
