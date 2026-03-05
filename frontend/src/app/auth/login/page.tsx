"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { loginUser, verify2FALogin } from "@/services/authService";
import Link from "next/link";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { countryCodeToFlag } from "@/data/countries";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isVerificationError, setIsVerificationError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [show2FA, setShow2FA] = useState(false);
  const [twoFAUserId, setTwoFAUserId] = useState<number | null>(null);
  const [twoFACountry, setTwoFACountry] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState(["", "", "", "", "", ""]);
  const [verifying2FA, setVerifying2FA] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerificationError(false);
    setLoading(true);

    const res = await loginUser(formData);
    setLoading(false);

    if (res.success) {
      if (res.requires2FA) {
        setTwoFAUserId(res.userId);
        setTwoFACountry(res.user?.country || null);
        setShow2FA(true);
        setTwoFACode(["", "", "", "", "", ""]);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }
      if (res.user.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/";
      }
    } else {
      const msg = res.message || t("invalidCredentials");
      const isNotVerified = msg.includes("verify") || msg.includes("vérif") || res.code === "EMAIL_NOT_VERIFIED";
      setIsVerificationError(isNotVerified);
      setError(msg);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...twoFACode];
    newCode[index] = value.slice(-1);
    setTwoFACode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== "") && newCode.join("").length === 6) {
      submit2FA(newCode.join(""));
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !twoFACode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      const digits = paste.split("");
      setTwoFACode(digits);
      submit2FA(paste);
    }
  };

  const submit2FA = async (code: string) => {
    if (!twoFAUserId) return;
    setVerifying2FA(true);
    setError("");

    const res = await verify2FALogin(twoFAUserId, code);
    setVerifying2FA(false);

    if (res.success) {
      if (res.user.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/";
      }
    } else {
      setError(res.message || t("invalid2FA"));
      setTwoFACode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  if (show2FA) {
    return (
      <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-3 sm:px-4">
        <div className="w-full max-w-sm bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            {twoFACountry ? (
              <span className="text-3xl sm:text-4xl">{countryCodeToFlag(twoFACountry)}</span>
            ) : (
              <ShieldCheck size={28} className="text-blue-600 sm:w-8 sm:h-8" />
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t("twoFactorRequired")}</h2>
          <p className="text-gray-500 text-sm mb-6">{t("enter2FACode")}</p>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}

          <div className="flex justify-center gap-1.5 sm:gap-2 mb-6" onPaste={handleCodePaste}>
            {twoFACode.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                disabled={verifying2FA}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition disabled:opacity-50"
              />
            ))}
          </div>

          {verifying2FA && (
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-4">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
              {t("verifying2FA")}
            </div>
          )}

          <button
            onClick={() => { setShow2FA(false); setError(""); setTwoFACode(["", "", "", "", "", ""]); }}
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition min-h-[44px] inline-flex items-center touch-manipulation"
          >
            {t("backToLogin")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-3 sm:px-4">
      <div className="w-full max-w-md bg-white p-5 sm:p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{t("welcome")}</h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">{t("loginSubtitle")}</p>
        </div>

        {error && (
          <div className={`p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm border ${isVerificationError ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-600 border-red-200"}`}>
            <div className="flex items-start gap-2">
              {isVerificationError && <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />}
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
            <input type="password" name="password" required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="********"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="current-password"
            />
            <div className="flex justify-end mt-1">
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline font-medium min-h-[36px] inline-flex items-center touch-manipulation">
                {t("forgotPassword")}
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-black text-white min-h-[48px] rounded-lg font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50 touch-manipulation active:scale-[0.98]">
            {loading ? t("loggingIn") : t("loginButton")}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-500">o</span>
            </div>
          </div>

          <a
            href={`${process.env.NEXT_PUBLIC_API_URL || ""}/auth/google${typeof window !== "undefined" ? `?redirect_uri=${encodeURIComponent(window.location.origin)}` : ""}`}
            className="w-full min-h-[48px] rounded-lg font-medium border-2 border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition touch-manipulation"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Entrar con Google
          </a>

          <p className="text-center text-sm text-gray-500">
            <Link href="/auth/magic-link" className="text-blue-600 hover:underline font-medium">
              Entrar con enlace mágico (sin contraseña)
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("noAccount")}{" "}
          <Link href="/auth/register" prefetch={false} className="text-blue-600 font-semibold hover:underline touch-manipulation">
            {t("registerFree")}
          </Link>
        </p>
      </div>
    </div>
  );
}
