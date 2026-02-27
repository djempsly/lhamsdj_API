"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { registerUser } from "@/services/authService";
import Link from "next/link";
import { Check, X, Mail } from "lucide-react";
import { Turnstile } from '@marsidev/react-turnstile';
import PasswordInput from "@/components/ui/PasswordInput";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  const [captchaToken, setCaptchaToken] = useState("");

  useEffect(() => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
  }, []);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validations = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[\W_]/.test(formData.password),
    match: formData.password === formData.confirmPassword
  };

  const isFormValid = Object.values(validations).every(Boolean) &&
                      formData.name &&
                      formData.email &&
                      captchaToken;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError(t("fillAllFields"));
      return;
    }

    setError("");
    setLoading(true);

    const { confirmPassword, ...dataFields } = formData;

    try {
      const res = await registerUser({
        ...dataFields,
        captchaToken
      });

      if (res.success) {
        setRegisteredEmail(formData.email);
        setSuccess(true);
        setFormData({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
        setCaptchaToken("");
      } else {
        setError(res.message || t("invalidCredentials"));
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t("accountCreated")}</h2>

          <p className="text-gray-600 mb-1">{t("emailSent")}</p>
          {registeredEmail && (
            <p className="text-base font-semibold text-gray-900 mb-4">{registeredEmail}</p>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 font-medium text-sm">{t("checkInbox")}</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
            <p className="text-gray-600 text-xs">{t("mustVerify")}</p>
            <p className="text-gray-400 text-xs mt-1">{t("checkSpam")}</p>
          </div>

          <Link
            href="/auth/login"
            prefetch={false}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {t("goToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">{t("createAccount")}</h2>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("fullName")}</label>
            <input name="name" type="text" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="John Doe"
              value={formData.name} onChange={handleChange} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="you@example.com"
              value={formData.email} onChange={handleChange} autoComplete="email" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
            <PasswordInput
              name="password"
              placeholder="********"
              required
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("confirmPassword")}</label>
            <PasswordInput
              name="confirmPassword"
              placeholder="********"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={validations.match && formData.password ? 'border-green-500 focus:ring-green-500' : ''}
              autoComplete="new-password"
            />
          </div>

          <div className="text-xs space-y-1 bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold text-gray-500 mb-2">{t("securityReqs")}:</p>
            <RequirementItem fulfilled={validations.length} text={t("minChars")} />
            <RequirementItem fulfilled={validations.uppercase} text={t("uppercase")} />
            <RequirementItem fulfilled={validations.lowercase} text={t("lowercase")} />
            <RequirementItem fulfilled={validations.number} text={t("oneNumber")} />
            <RequirementItem fulfilled={validations.symbol} text={t("oneSymbol")} />
            <RequirementItem fulfilled={validations.match && formData.password.length > 0} text={t("passwordsMatch")} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("phoneOptional")}</label>
            <input name="phone" type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="+1 809..."
              value={formData.phone} onChange={handleChange} />
          </div>

          <div className="flex justify-center my-2">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken("")}
            />
          </div>

          <button type="submit" disabled={loading || !isFormValid}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition">
            {loading ? t("registering") : t("registerButton")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("haveAccount")}{" "}
          <Link href="/auth/login" prefetch={false} className="text-blue-600 font-semibold hover:underline">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}

function RequirementItem({ fulfilled, text }: { fulfilled: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 ${fulfilled ? "text-green-600" : "text-gray-400"}`}>
      {fulfilled ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );
}
