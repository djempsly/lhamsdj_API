"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { Globe, Check } from "lucide-react";

const localeConfig = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const switchTo = (code: string) => {
    document.cookie = `locale=${code};path=/;max-age=31536000`;
    window.location.reload();
  };

  const current = localeConfig.find(l => l.code === locale) || localeConfig[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 min-h-[36px] px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition touch-manipulation"
        aria-label="Language"
      >
        <span className="text-base">{current?.flag}</span>
        <span className="font-medium text-xs">{current?.code.toUpperCase()}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
            {localeConfig.map(l => (
              <button
                key={l.code}
                onClick={() => switchTo(l.code)}
                className={`w-full text-left px-3 min-h-[42px] text-sm flex items-center gap-2.5 hover:bg-blue-50 transition touch-manipulation ${
                  l.code === locale ? "bg-blue-50 font-semibold text-blue-700" : "text-gray-600"
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {l.code === locale && <Check size={14} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
