"use client";

import { ShoppingCart } from "lucide-react";

type Props = {
  price: string;
  onAddToCart: () => void;
  disabled?: boolean;
  adding?: boolean;
  addLabel: string;
  addingLabel: string;
};

export default function StickyMobileBar({ price, onAddToCart, disabled, adding, addLabel, addingLabel }: Props) {
  return (
    <div
      className="lg:hidden sticky bottom-0 z-50 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-3"
      style={{ borderTop: "1px solid #f3f4f6", boxShadow: "0 -4px 16px rgba(0,0,0,0.04)" }}
    >
      <span
        className="text-xl font-bold"
        style={{ background: "linear-gradient(135deg, #8b5cf6, #d946ef)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        ${price}
      </span>
      <button
        onClick={onAddToCart}
        disabled={disabled || adding}
        className="flex-1 max-w-[220px] text-white font-bold text-sm py-3 flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
        style={{
          borderRadius: 12,
          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
        }}
      >
        <ShoppingCart size={16} />
        {adding ? addingLabel : addLabel}
      </button>
    </div>
  );
}
