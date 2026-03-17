/** Rotating accent colors for product cards across all sections */
export const CARD_COLORS = [
  { name: "purple", border: "#8b5cf6", shadow: "0 8px 28px rgba(139,92,246,0.25)", btnGrad: "linear-gradient(135deg, #8b5cf6, #7c3aed)", bg: "rgba(139,92,246,0.08)" },
  { name: "pink", border: "#ec4899", shadow: "0 8px 28px rgba(236,72,153,0.25)", btnGrad: "linear-gradient(135deg, #ec4899, #db2777)", bg: "rgba(236,72,153,0.08)" },
  { name: "cyan", border: "#06b6d4", shadow: "0 8px 28px rgba(6,182,212,0.25)", btnGrad: "linear-gradient(135deg, #06b6d4, #0891b2)", bg: "rgba(6,182,212,0.08)" },
  { name: "amber", border: "#f59e0b", shadow: "0 8px 28px rgba(245,158,11,0.25)", btnGrad: "linear-gradient(135deg, #f59e0b, #d97706)", bg: "rgba(245,158,11,0.08)" },
  { name: "green", border: "#22c55e", shadow: "0 8px 28px rgba(34,197,94,0.25)", btnGrad: "linear-gradient(135deg, #22c55e, #16a34a)", bg: "rgba(34,197,94,0.08)" },
  { name: "red", border: "#ef4444", shadow: "0 8px 28px rgba(239,68,68,0.25)", btnGrad: "linear-gradient(135deg, #ef4444, #dc2626)", bg: "rgba(239,68,68,0.08)" },
];

export const BADGE_GRADIENTS = {
  discount: "linear-gradient(135deg, #ef4444, #f97316)",
  new: "linear-gradient(135deg, #8b5cf6, #6366f1)",
  bestSeller: "linear-gradient(135deg, #f59e0b, #eab308)",
  hot: "linear-gradient(135deg, #ec4899, #d946ef)",
};

/** Category-based placeholder colors when product has no image */
export const CATEGORY_PLACEHOLDERS: Record<string, { bg: string; icon: string }> = {
  electronics: { bg: "linear-gradient(135deg, #1e1b4b, #312e81)", icon: "💻" },
  fashion: { bg: "linear-gradient(135deg, #4a044e, #701a75)", icon: "👗" },
  home: { bg: "linear-gradient(135deg, #052e16, #166534)", icon: "🏠" },
  sports: { bg: "linear-gradient(135deg, #7c2d12, #c2410c)", icon: "⚽" },
  beauty: { bg: "linear-gradient(135deg, #831843, #be185d)", icon: "💄" },
  toys: { bg: "linear-gradient(135deg, #3b0764, #7e22ce)", icon: "🎮" },
  books: { bg: "linear-gradient(135deg, #1e3a5f, #2563eb)", icon: "📚" },
  default: { bg: "linear-gradient(135deg, #374151, #6b7280)", icon: "📦" },
};

export function getCategoryPlaceholder(categoryName?: string) {
  if (!categoryName) return CATEGORY_PLACEHOLDERS.default;
  const key = categoryName.toLowerCase();
  for (const [cat, val] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (key.includes(cat)) return val;
  }
  return CATEGORY_PLACEHOLDERS.default;
}
