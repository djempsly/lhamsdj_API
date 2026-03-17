"use client";

import { useState, useEffect, useRef } from "react";
import { Star, Trash2, ThumbsUp, BadgeCheck, MessageSquare, HelpCircle, Send } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getProductReviews, createReview, deleteReview } from "@/services/reviewService";
import { checkSession } from "@/services/authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/* ═══ Types ═══ */
interface Review {
  id: number; userId: number; productId: number; rating: number; comment: string | null; createdAt: string;
  user: { name: string; profileImage?: string };
}
interface Question {
  id: number; question: string; answer: string | null; answeredAt: string | null; createdAt: string;
  user: { id: number; name: string };
}
type ProductSpec = { label: string; value: string };

/* ═══ Avatar colors ═══ */
const AVATAR_GRADS = [
  "linear-gradient(135deg, #8b5cf6, #6366f1)",
  "linear-gradient(135deg, #ec4899, #db2777)",
  "linear-gradient(135deg, #06b6d4, #0891b2)",
  "linear-gradient(135deg, #f59e0b, #d97706)",
  "linear-gradient(135deg, #22c55e, #16a34a)",
  "linear-gradient(135deg, #ef4444, #dc2626)",
];

/* ═══ Main Component ═══ */
export default function ProductTabs({ productId, specs, reviewsRef }: { productId: number; specs: ProductSpec[]; reviewsRef?: React.RefObject<HTMLDivElement | null> }) {
  const t = useTranslations("productPage");
  const tr = useTranslations("reviews");
  const [tab, setTab] = useState<"specs" | "reviews" | "qa">("specs");

  const tabs = [
    { key: "specs" as const, label: t("tabSpecs") },
    { key: "reviews" as const, label: t("tabReviews") },
    { key: "qa" as const, label: t("tabQA") },
  ];

  return (
    <section ref={reviewsRef}>
      {/* Segmented control */}
      <div className="flex p-1 mb-6" style={{ background: "#f8f8fa", borderRadius: 12 }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              borderRadius: 8,
              background: tab === key ? "white" : "transparent",
              boxShadow: tab === key ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
              color: tab === key ? "#111827" : "#9ca3af",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content with fadeUp */}
      <div key={tab} className="animate-[fadeUp_300ms_ease]">
        {tab === "specs" && <SpecsTab specs={specs} />}
        {tab === "reviews" && <ReviewsTab productId={productId} />}
        {tab === "qa" && <QATab productId={productId} />}
      </div>

      <style jsx>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}

/* ═══ SPECS TAB ═══ */
function SpecsTab({ specs }: { specs: ProductSpec[] }) {
  const t = useTranslations("productPage");
  if (specs.length === 0) return <p className="text-sm text-gray-400 py-8 text-center">{t("noSpecs")}</p>;

  return (
    <div className="overflow-hidden" style={{ borderRadius: 12, border: "1px solid #f3f4f6" }}>
      <table className="w-full text-sm" style={{ borderCollapse: "separate" }}>
        <tbody>
          {specs.map((spec, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "white" }}>
              <td className="px-4 py-3 font-medium text-gray-600 w-1/3">{spec.label}</td>
              <td className="px-4 py-3 text-gray-900">{spec.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══ REVIEWS TAB ═══ */
function ReviewsTab({ productId }: { productId: number }) {
  const t = useTranslations("reviews");
  const tp = useTranslations("productPage");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: number } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<number | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await getProductReviews(productId);
    if (res.success && res.data) setReviews(Array.isArray(res.data) ? res.data : []);
    else setReviews([]);
    setLoading(false);
  };

  useEffect(() => {
    checkSession().then(res => { if (res?.success && res.user) setUser(res.user); else setUser(null); });
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) { setError(t("loginToReview")); return; }
    if (rating < 1) { setError(t("selectRating")); return; }
    setSubmitting(true);
    const res = await createReview({ productId, rating, comment });
    if (res.success) { setRating(0); setComment(""); await fetchReviews(); }
    else setError(res.message || "Error");
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteConfirm"))) return;
    setDeletingId(id);
    const res = await deleteReview(id);
    if (res.success) setReviews(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
  };

  const avg = reviews.length > 0 ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const dist = [5, 4, 3, 2, 1].map(s => ({ star: s, count: reviews.filter(r => r.rating === s).length }));
  const filtered = filter ? reviews.filter(r => r.rating === filter) : reviews;

  return (
    <div>
      {/* Score + distribution */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div
            className="flex flex-col items-center justify-center px-8 py-5"
            style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.1)", borderRadius: 14 }}
          >
            <span
              className="text-4xl font-bold"
              style={{ background: "linear-gradient(135deg, #f59e0b, #eab308)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              {avg.toFixed(1)}
            </span>
            <div className="flex mt-1">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className={s <= Math.round(avg) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}</div>
            <span className="text-xs text-gray-500 mt-1">
              {reviews.length} {reviews.length === 1 ? t("reviewCount") : t("reviewsCount")}
            </span>
          </div>
          <div className="flex-1 space-y-1.5">
            {dist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-8">{star} ★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%`, background: "linear-gradient(135deg, #f59e0b, #eab308)" }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter pills */}
      {reviews.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => setFilter(null)}
            className="px-3 py-1.5 text-xs font-medium rounded-full transition-all flex-shrink-0"
            style={{
              background: filter === null ? "rgba(139,92,246,0.08)" : "transparent",
              color: filter === null ? "#8b5cf6" : "#9ca3af",
              border: filter === null ? "1px solid rgba(139,92,246,0.3)" : "1px solid #e5e7eb",
            }}
          >
            {tp("filterAll")} ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map(s => {
            const count = reviews.filter(r => r.rating === s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className="px-3 py-1.5 text-xs font-medium rounded-full transition-all flex-shrink-0"
                style={{
                  background: filter === s ? "rgba(139,92,246,0.08)" : "transparent",
                  color: filter === s ? "#8b5cf6" : "#9ca3af",
                  border: filter === s ? "1px solid rgba(139,92,246,0.3)" : "1px solid #e5e7eb",
                }}
              >
                {s} ★ ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Review cards */}
      {loading ? (
        <p className="text-gray-400 py-8 text-center text-sm">{t("loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 py-8 text-center text-sm">{t("noReviews")}</p>
      ) : (
        <div className="space-y-4 mb-8">
          {filtered.map((review, idx) => (
            <div key={review.id} className="p-4 bg-white border border-gray-100" style={{ borderRadius: 14 }}>
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: AVATAR_GRADS[idx % AVATAR_GRADS.length] }}
                >
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-gray-900">{review.user.name}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
                      <BadgeCheck size={11} className="text-green-500" /> {tp("verified")}
                    </span>
                    <span className="text-[11px] text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} className={s <= review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />)}
                  </div>
                  {review.comment && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <button className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-purple-600 transition-colors" style={{ borderRadius: 8 }}>
                      <ThumbsUp size={12} /> {tp("helpful")}
                    </button>
                  </div>
                </div>
                {user && user.id === review.userId && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write review form */}
      <div className="p-4 sm:p-5 border border-gray-100" style={{ borderRadius: 14, background: "#fafafa" }}>
        <h4 className="font-semibold text-sm mb-3">{t("writeReview")}</h4>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i} type="button"
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHoverRating(i)}
                  className="p-0.5 transition hover:scale-110"
                >
                  <Star size={24} className={i <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 text-sm focus:border-purple-300 focus:ring-1 focus:ring-purple-200 outline-none resize-none"
              style={{ borderRadius: 10 }}
              placeholder={t("comment")}
            />
            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="text-white text-sm font-bold px-5 py-2.5 disabled:opacity-50 transition-all"
              style={{ borderRadius: 10, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", boxShadow: "0 4px 12px rgba(139,92,246,0.2)" }}
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </form>
        ) : (
          <Link href="/auth/login" className="text-purple-600 hover:text-purple-800 text-sm font-medium underline">{t("loginToReview")}</Link>
        )}
      </div>
    </div>
  );
}

/* ═══ Q&A TAB ═══ */
function QATab({ productId }: { productId: number }) {
  const t = useTranslations("productPage");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQ, setNewQ] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: number } | null>(null);

  useEffect(() => {
    checkSession().then(res => { if (res?.success && res.user) setUser(res.user); else setUser(null); });
    fetch(`${API_URL}/marketplace/questions/${productId}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => { if (j.success && Array.isArray(j.data)) setQuestions(j.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQ.trim() || !user) return;
    setSubmitting(true);
    try {
      const { apiFetch } = await import("@/lib/apiFetch");
      const res = await apiFetch(`${API_URL}/marketplace/questions/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newQ }),
      });
      const j = await res.json();
      if (j.success) { setQuestions(prev => [j.data, ...prev]); setNewQ(""); }
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  return (
    <div>
      {/* Ask question form */}
      {user ? (
        <form onSubmit={handleAsk} className="flex gap-2 mb-6">
          <input
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            placeholder={t("qaPlaceholder")}
            className="flex-1 px-3 py-2.5 border border-gray-200 text-sm focus:border-purple-300 focus:ring-1 focus:ring-purple-200 outline-none"
            style={{ borderRadius: 10 }}
          />
          <button
            type="submit"
            disabled={submitting || !newQ.trim()}
            className="text-white px-4 py-2.5 disabled:opacity-50 transition-all flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
            style={{ borderRadius: 10, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)" }}
          >
            <Send size={14} /> {t("qaAsk")}
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-6">
          <Link href="/auth/login" className="text-purple-600 hover:text-purple-800 font-medium underline">{t("qaLoginToAsk")}</Link>
        </p>
      )}

      {loading ? (
        <p className="text-gray-400 py-8 text-center text-sm">{t("qaLoading")}</p>
      ) : questions.length === 0 ? (
        <p className="text-gray-400 py-8 text-center text-sm">{t("qaEmpty")}</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="space-y-2">
              <div className="flex gap-2.5">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(139,92,246,0.08)", color: "#8b5cf6", borderRadius: 5 }}
                >
                  Q
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{q.question}</p>
                  <span className="text-[10px] text-gray-400">{q.user.name} · {formatDate(q.createdAt)}</span>
                </div>
              </div>
              {q.answer && (
                <div className="flex gap-2.5 ml-8">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(34,197,94,0.08)", color: "#22c55e", borderRadius: 5 }}
                  >
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{q.answer}</p>
                    {q.answeredAt && <span className="text-[10px] text-gray-400">{formatDate(q.answeredAt)}</span>}
                  </div>
                </div>
              )}
              {i < questions.length - 1 && <hr className="border-gray-100 mt-3" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══ Helper ═══ */
function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return dateStr; }
}
