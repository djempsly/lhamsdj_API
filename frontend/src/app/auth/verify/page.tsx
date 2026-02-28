"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { verifyUserEmail, verifyByCode } from "@/services/authService";
import Link from "next/link";

function VerifyContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "code-input" | "success" | "error">(
    token ? "loading" : "code-input"
  );
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(emailParam || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!token) return;

    verifyUserEmail(token)
      .then((res) => {
        if (res.success) {
          setStatus("success");
          setMessage(res.message);
        } else {
          setStatus("error");
          setMessage(res.message || t("invalidCode"));
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Connection error");
      });
  }, [token, t]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6 || !email) return;

    setSubmitting(true);
    setMessage("");

    try {
      const res = await verifyByCode(email, fullCode);
      if (res.success) {
        setStatus("success");
        setMessage(res.message);
      } else {
        setMessage(res.message || t("invalidCode"));
      }
    } catch {
      setMessage("Connection error");
    } finally {
      setSubmitting(false);
    }
  };

  const fullCode = code.join("");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">

        {status === "loading" && (
          <div className="flex flex-col items-center py-8">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-700">{t("verifying")}</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">{t("accountVerified")}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/auth/login"
              className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              {t("loginButton")}
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">{t("verifyAccount")}</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              href="/auth/register"
              className="text-blue-600 hover:underline font-medium"
            >
              {t("registerFree")}
            </Link>
          </div>
        )}

        {status === "code-input" && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("enterDigitCode")}</h2>
            <p className="text-gray-500 text-sm mb-6">{t("enterCodeDesc")}</p>

            {!emailParam && (
              <div className="w-full mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-center"
                  required
                />
              </div>
            )}

            <form onSubmit={handleSubmitCode} className="w-full">
              <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {message && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={fullCode.length !== 6 || !email || submitting}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? t("verifying") : t("verifyCode")}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              {t("haveAccount")}{" "}
              <Link href="/auth/login" className="text-blue-600 font-semibold hover:underline">
                {t("loginLink")}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
