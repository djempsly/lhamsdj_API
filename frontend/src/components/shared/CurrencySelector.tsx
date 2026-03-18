"use client";

import { useState, useRef, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { ChevronDown } from "lucide-react";

export default function CurrencySelector() {
  const { currency, currencies, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (currencies.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs hover:text-white transition whitespace-nowrap"
      >
        {currency.symbol} {currency.code}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 w-48 bg-white text-gray-900 rounded-xl border shadow-xl z-20 py-1 max-h-60 overflow-y-auto"
            style={{ borderRadius: 12 }}
          >
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-purple-50 transition ${
                  currency.code === c.code ? "bg-purple-50 font-semibold text-purple-700" : ""
                }`}
              >
                <span>{c.symbol} {c.code}</span>
                <span className="text-xs text-gray-400">{c.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
