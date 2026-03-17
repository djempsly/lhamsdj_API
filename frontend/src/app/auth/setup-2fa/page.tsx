"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { setup2FA, enable2FA } from "@/services/authService";
import { ShieldCheck, Copy, Check, Loader2 } from "lucide-react";

export default function Setup2FAPage() {
  const t = useTranslations("auth");

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [activating, setActivating] = useState(false);

  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    loadQR();
  }, []);

  async function loadQR() {
    setLoading(true);
    setError("");
    const res = await setup2FA();
    setLoading(false);
    if (res.success && res.data) {
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setTimeout(() => inputRefs.current[0]?.focus(), 200);
    } else {
      setError(res.message || t("setup2FAError"));
    }
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== "") && newCode.join("").length === 6) {
      submitCode(newCode.join(""));
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      const digits = paste.split("");
      setCode(digits);
      submitCode(paste);
    }
  }

  async function submitCode(token: string) {
    setActivating(true);
    setError("");
    const res = await enable2FA(token);
    setActivating(false);

    if (res.success && res.data?.backupCodes) {
      setBackupCodes(res.data.backupCodes);
    } else {
      setError(res.message || t("invalid2FA"));
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }

  async function copyBackupCodes() {
    if (!backupCodes) return;
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  }

  // Step 3: Show backup codes after successful activation
  if (backupCodes) {
    return (
      <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-3 sm:px-4">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t("setup2FASuccess")}</h2>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-amber-800 mb-2">{t("setup2FABackupTitle")}</h3>
            <p className="text-sm text-amber-700 mb-3">{t("setup2FABackupDescription")}</p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm bg-white rounded p-3 border">
              {backupCodes.map((c, i) => (
                <span key={i} className="text-gray-800">{c}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyBackupCodes}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition min-h-[44px]"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? t("setup2FABackupCopied") : t("setup2FABackupCopy")}
            </button>
            <button
              onClick={() => { window.location.href = "/admin/dashboard"; }}
              className="flex-1 bg-black text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition min-h-[44px]"
            >
              {t("setup2FABackupContinue")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Loading QR
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-3 sm:px-4">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <Loader2 size={32} className="animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{t("setup2FALoading")}</p>
        </div>
      </div>
    );
  }

  // Step 2: Show QR + code input
  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-3 sm:px-4">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={28} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t("setup2FATitle")}</h2>
          <p className="text-gray-500 text-sm mt-2">{t("setup2FADescription")}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        {qrCode && (
          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="QR Code" className="w-48 h-48 rounded-lg border" />
          </div>
        )}

        {secret && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Clave manual:</p>
            <code className="text-sm font-mono text-gray-800 break-all select-all">{secret}</code>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-3 mb-6 space-y-1">
          <p className="text-sm text-blue-800">{t("setup2FAStep1")}</p>
          <p className="text-sm text-blue-800">{t("setup2FAStep2")}</p>
          <p className="text-sm text-blue-800 font-medium">{t("setup2FAStep3")}</p>
        </div>

        <div className="flex justify-center gap-1.5 sm:gap-2 mb-4" onPaste={handleCodePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(i, e.target.value)}
              onKeyDown={(e) => handleCodeKeyDown(i, e)}
              disabled={activating}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition disabled:opacity-50"
            />
          ))}
        </div>

        {activating && (
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mb-4">
            <Loader2 size={16} className="animate-spin" />
            {t("setup2FAActivating")}
          </div>
        )}

        <button
          onClick={() => {
            const token = code.join("");
            if (token.length === 6) submitCode(token);
          }}
          disabled={activating || code.some((d) => d === "")}
          className="w-full bg-black text-white min-h-[48px] rounded-lg font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50"
        >
          {activating ? t("setup2FAActivating") : t("setup2FAConfirm")}
        </button>

        <div className="text-center mt-4">
          <button
            onClick={() => { window.location.href = "/auth/login"; }}
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition"
          >
            {t("backToLogin")}
          </button>
        </div>
      </div>
    </div>
  );
}
