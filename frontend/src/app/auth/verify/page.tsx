"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { verifyUserEmail } from "@/services/authService";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("invalidCode"));
      return;
    }

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

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">

        {status === "loading" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-700">{t("verifying")}</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
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
              <XCircle className="w-8 h-8 text-red-600" />
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
      </div>
    </div>
  );
}

function VerifyFallback() {
  const t = useTranslations("auth");
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      <span className="ml-2 text-gray-500">{t("verifying")}</span>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyFallback />}>
      <VerifyContent />
    </Suspense>
  );
}
