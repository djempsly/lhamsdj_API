"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { getProductReviews, createReview, deleteReview } from "@/services/reviewService";
import { checkSession } from "@/services/authService";

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; profileImage?: string };
}

interface ReviewSectionProps {
  productId: number;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const t = useTranslations("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: number } | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await getProductReviews(productId);
    if (res.success && res.data) {
      setReviews(res.data);
    } else {
      setReviews([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkSession().then((res) => {
      if (res?.success && res.user) setUser(res.user);
      else setUser(null);
    });
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError(t("loginToReview"));
      return;
    }

    if (rating < 1 || rating > 5) {
      setError(t("selectRating"));
      return;
    }

    setSubmitting(true);
    const res = await createReview({ productId, rating, comment });

    if (res.success) {
      setRating(0);
      setComment("");
      setError(null);
      await fetchReviews();
    } else {
      setError(res.message || "Error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteConfirm"))) return;
    setDeletingId(id);
    const res = await deleteReview(id);
    if (res.success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert(res.message || "Error");
    }
    setDeletingId(null);
  };

  const displayRating = (value: number) => hoverRating || value;
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="mt-16 pt-10 border-t border-gray-200">
      <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>

      {/* Average rating */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={20}
                className={`${i <= Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {t("averageRating")}: {averageRating.toFixed(1)} ({reviews.length}{" "}
            {reviews.length === 1 ? t("reviewCount") : t("reviewsCount")})
          </span>
        </div>
      )}

      {/* Review form */}
      <div className="mb-10">
        <h3 className="font-semibold text-lg mb-3">{t("writeReview")}</h3>
        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("rating")}
              </label>
              <div
                className="flex gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    className="p-1 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded"
                  >
                    <Star
                      size={28}
                      className={
                        i <= displayRating(rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("comment")}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none resize-none"
                placeholder={t("comment")}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </form>
        ) : (
          <p className="text-gray-600 py-2">
            <Link
              href="/auth/login"
              className="text-amber-600 hover:text-amber-700 font-medium underline"
            >
              {t("loginToReview")}
            </Link>
          </p>
        )}
      </div>

      {/* Reviews list */}
      {loading ? (
        <p className="text-gray-500 py-6">{t("loading")}</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 py-6">{t("noReviews")}</p>
      ) : (
        <ul className="space-y-6">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${i <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-gray-900">
                      {review.user.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 mt-1">{review.comment}</p>
                  )}
                </div>
                {user && user.id === review.userId && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0 disabled:opacity-50"
                    title={t("delete")}
                    aria-label={t("delete")}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
