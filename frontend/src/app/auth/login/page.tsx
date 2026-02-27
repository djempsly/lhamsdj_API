"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { loginUser } from "@/services/authService";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isVerificationError, setIsVerificationError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerificationError(false);
    setLoading(true);

    const res = await loginUser(formData);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'ADMIN') {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/";
      }
    } else {
      const msg = res.message || t("invalidCredentials");
      const isNotVerified = msg.includes("verify") || msg.includes("vérif") || res.code === 'EMAIL_NOT_VERIFIED';
      setIsVerificationError(isNotVerified);
      setError(msg);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t("welcome")}</h2>
          <p className="text-gray-500 mt-2">{t("loginSubtitle")}</p>
        </div>

        {error && (
          <div className={`p-4 rounded-lg mb-6 text-sm border ${isVerificationError ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
            <div className="flex items-start gap-2">
              {isVerificationError && <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />}
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="********"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              autoComplete="current-password"
            />
            <div className="flex justify-end mt-1">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {t("forgotPassword")}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50"
          >
            {loading ? t("loggingIn") : t("loginButton")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("noAccount")}{" "}
          <Link href="/auth/register" prefetch={false} className="text-blue-600 font-semibold hover:underline">
            {t("registerFree")}
          </Link>
        </p>
      </div>
    </div>
  );
}
