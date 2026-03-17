"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Star, Check, XCircle, MessageSquare } from "lucide-react";
import { getReviewsAdmin, moderateReview } from "@/services/productService";
import { showToast } from "@/components/shared/Toast";
import type { AdminReview } from "@/types";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: { id: StatusFilter; labelKey: string; ns: "admin" | "common" }[] = [
  { id: "ALL", labelKey: "allReviews", ns: "admin" },
  { id: "PENDING", labelKey: "reviewPending", ns: "admin" },
  { id: "APPROVED", labelKey: "reviewApprovedStatus", ns: "admin" },
  { id: "REJECTED", labelKey: "reviewRejectedStatus", ns: "admin" },
];

const BADGE_STYLES: Record<AdminReview["status"], { bg: string; text: string }> = {
  PENDING: { bg: "rgba(245,158,11,0.12)", text: "#b45309" },
  APPROVED: { bg: "rgba(34,197,94,0.12)", text: "#15803d" },
  REJECTED: { bg: "rgba(239,68,68,0.12)", text: "#b91c1c" },
};

const LIMIT = 10;

export default function AdminReviewsPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [moderatingId, setModeratingId] = useState<number | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const params: { status?: string; page: number; limit: number } = { page, limit: LIMIT };
    if (activeTab !== "ALL") params.status = activeTab;
    const res = await getReviewsAdmin(params);
    if (res.success) {
      setReviews(Array.isArray(res.data) ? res.data : []);
      setTotalPages(res.pagination?.totalPages ?? 1);
    }
    setLoading(false);
  }, [activeTab, page]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleTabChange = (tab: StatusFilter) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleModerate = async (id: number, status: "APPROVED" | "REJECTED") => {
    setModeratingId(id);
    const res = await moderateReview(id, status);
    if (res.success) {
      showToast(t(status === "APPROVED" ? "reviewApproved" : "reviewRejected"), "success");
      loadReviews();
    } else {
      showToast("Error", "error");
    }
    setModeratingId(null);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "text-yellow-400" : "text-gray-200"}
          fill={i < rating ? "#facc15" : "none"}
        />
      ))}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-2.5 rounded-full"
          style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}
        >
          <MessageSquare size={22} />
        </div>
        <h1 className="text-2xl font-bold">{t("reviewModeration")}</h1>
      </div>

      {/* Segmented control tabs */}
      <div className="inline-flex p-1 mb-6 bg-gray-100" style={{ borderRadius: 10 }}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="px-4 py-2 text-sm font-medium transition-all"
              style={{
                borderRadius: 8,
                background: isActive ? "white" : "transparent",
                color: isActive ? "#8b5cf6" : "#6b7280",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="p-10 text-center text-gray-400">{t("loadingData")}</div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border overflow-hidden" style={{ borderRadius: 12 }}>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-medium text-gray-500">{t("reviewProduct")}</th>
                  <th className="p-4 font-medium text-gray-500">{t("reviewer")}</th>
                  <th className="p-4 font-medium text-gray-500">{t("reviewRating")}</th>
                  <th className="p-4 font-medium text-gray-500">{t("reviewComment")}</th>
                  <th className="p-4 font-medium text-gray-500">{tCommon("status")}</th>
                  <th className="p-4 font-medium text-gray-500">{tCommon("date")}</th>
                  <th className="p-4 font-medium text-gray-500 text-right">{tCommon("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => {
                  const badge = BADGE_STYLES[review.status];
                  const productImage = review.product?.images?.[0]?.url ?? null;
                  return (
                    <tr key={review.id} className="border-b hover:bg-gray-50/50 transition-colors">
                      {/* Product */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {productImage ? (
                            <div className="relative w-10 h-10 flex-shrink-0 overflow-hidden" style={{ borderRadius: 8 }}>
                              <Image src={productImage} alt={review.product?.name ?? ""} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center flex-shrink-0" style={{ borderRadius: 8 }}>
                              <Star size={16} className="text-gray-300" />
                            </div>
                          )}
                          <span className="font-medium text-gray-800 line-clamp-1">
                            {review.product?.name ?? `#${review.productId}`}
                          </span>
                        </div>
                      </td>

                      {/* Reviewer */}
                      <td className="p-4 text-gray-700">
                        {review.user?.name ?? `User #${review.userId}`}
                      </td>

                      {/* Rating */}
                      <td className="p-4">{renderStars(review.rating)}</td>

                      {/* Comment */}
                      <td className="p-4">
                        <span className="text-gray-600 line-clamp-2 max-w-xs block">
                          {review.comment || "\u2014"}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="p-4">
                        <span
                          className="px-2.5 py-1 text-xs font-bold"
                          style={{ borderRadius: 6, background: badge.bg, color: badge.text }}
                        >
                          {review.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {review.status !== "APPROVED" && (
                            <button
                              onClick={() => handleModerate(review.id, "APPROVED")}
                              disabled={moderatingId === review.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white transition-all hover:shadow-md disabled:opacity-50"
                              style={{ borderRadius: 8, background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
                              title={t("approve")}
                            >
                              <Check size={13} />
                              {t("approve")}
                            </button>
                          )}
                          {review.status !== "REJECTED" && (
                            <button
                              onClick={() => handleModerate(review.id, "REJECTED")}
                              disabled={moderatingId === review.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white transition-all hover:shadow-md disabled:opacity-50"
                              style={{ borderRadius: 8, background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                              title={t("reject")}
                            >
                              <XCircle size={13} />
                              {t("reject")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {reviews.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-400">
                      {t("noReviewsToModerate")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-9 h-9 text-sm font-medium transition-all"
                  style={{
                    borderRadius: 8,
                    background: page === p ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "white",
                    color: page === p ? "white" : "#6b7280",
                    border: page === p ? "none" : "1px solid #e5e7eb",
                    boxShadow: page === p ? "0 4px 14px rgba(139,92,246,0.25)" : "none",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
