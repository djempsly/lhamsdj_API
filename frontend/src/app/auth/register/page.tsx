"use client";

import { useState, useEffect, useRef, Suspense, Component, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { registerUser } from "@/services/authService";
import Link from "next/link";
import dynamic from "next/dynamic";
import PasswordInput from "@/components/ui/PasswordInput";
import { COUNTRIES, type Country } from "@/data/countries";

const Turnstile = dynamic(
  () => import("@marsidev/react-turnstile").then((m) => ({ default: m.Turnstile })),
  { ssr: false, loading: () => <div className="h-[65px] flex items-center justify-center text-gray-400 text-sm">Loading captcha...</div> }
);

class CaptchaErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-xs text-amber-600 text-center p-2">CAPTCHA unavailable</div>;
    }
    return this.props.children;
  }
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
  });

  const [captchaToken, setCaptchaToken] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "", phone: "", country: "" });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    match: formData.password === formData.confirmPassword,
  };

  const fullPhone = selectedCountry ? `${selectedCountry.dial}${formData.phone}` : formData.phone;

  const isFormValid =
    Object.values(validations).every(Boolean) &&
    formData.name &&
    formData.email &&
    selectedCountry &&
    formData.phone.length >= 4 &&
    captchaToken;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setFormData({ ...formData, country: country.code });
    setCountryDropdownOpen(false);
    setCountrySearch("");
  };

  const filteredCountries = countrySearch
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          c.dial.includes(countrySearch) ||
          c.code.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : COUNTRIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError(t("fillAllFields"));
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: fullPhone,
        country: formData.country,
        captchaToken,
      });

      if (res.success) {
        setRegisteredEmail(formData.email);
        setSuccess(true);
        setFormData({ name: "", email: "", password: "", confirmPassword: "", phone: "", country: "" });
        setSelectedCountry(null);
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
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t("accountCreated")}</h2>
          <p className="text-gray-600 mb-1">{t("emailSent")}</p>
          {registeredEmail && <p className="text-base font-semibold text-gray-900 mb-4">{registeredEmail}</p>}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <p className="text-amber-800 font-medium text-sm">{t("checkInbox")}</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
            <p className="text-gray-600 text-xs">{t("mustVerify")}</p>
            <p className="text-gray-400 text-xs mt-1">{t("checkSpam")}</p>
          </div>
          <Link href={`/auth/verify?email=${encodeURIComponent(registeredEmail)}`} prefetch={false} className="inline-block w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition mb-3">
            {t("enterDigitCode")}
          </Link>
          <Link href="/auth/login" prefetch={false} className="text-sm text-gray-500 hover:underline">
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("fullName")}</label>
            <input name="name" type="text" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="John Doe"
              value={formData.name} onChange={handleChange} />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" type="email" required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              placeholder="you@example.com"
              value={formData.email} onChange={handleChange} autoComplete="email" />
          </div>

          {/* Country selector */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("country")}</label>
            <button
              type="button"
              onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
              className={`w-full px-4 py-2 border rounded-lg text-left flex items-center gap-2 transition ${
                selectedCountry ? "border-gray-300" : "border-gray-300 text-gray-400"
              } focus:ring-2 focus:ring-black focus:border-transparent outline-none`}
            >
              {selectedCountry ? (
                <>
                  <span className="text-xl leading-none">{selectedCountry.flag}</span>
                  <span className="text-gray-900">{selectedCountry.name}</span>
                  <span className="text-gray-400 text-sm ml-auto">{selectedCountry.dial}</span>
                </>
              ) : (
                <span>{t("selectCountry")}</span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`ml-auto shrink-0 transition ${countryDropdownOpen ? "rotate-180" : ""}`}>
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {countryDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-xl max-h-64 overflow-hidden">
                <div className="p-2 border-b sticky top-0 bg-white">
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    placeholder={t("searchCountry")}
                    className="w-full px-3 py-1.5 border rounded-md text-sm focus:ring-1 focus:ring-black outline-none"
                    autoFocus
                  />
                </div>
                <ul className="overflow-y-auto max-h-48">
                  {filteredCountries.map((c) => (
                    <li key={c.code}>
                      <button
                        type="button"
                        onClick={() => selectCountry(c)}
                        className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-50 transition text-sm ${
                          selectedCountry?.code === c.code ? "bg-gray-100 font-medium" : ""
                        }`}
                      >
                        <span className="text-lg leading-none">{c.flag}</span>
                        <span className="flex-1">{c.name}</span>
                        <span className="text-gray-400 text-xs">{c.dial}</span>
                      </button>
                    </li>
                  ))}
                  {filteredCountries.length === 0 && (
                    <li className="px-4 py-3 text-gray-400 text-sm text-center">{t("noResults")}</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Phone with country dial prefix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("phone")}</label>
            <div className="flex">
              <div className="flex items-center gap-1.5 px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-sm text-gray-600 shrink-0">
                {selectedCountry ? (
                  <>
                    <span className="text-base leading-none">{selectedCountry.flag}</span>
                    <span>{selectedCountry.dial}</span>
                  </>
                ) : (
                  <span className="text-gray-400">+--</span>
                )}
              </div>
              <input
                name="phone"
                type="tel"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="8091234567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{t("phoneForSecurity")}</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("password")}</label>
            <PasswordInput name="password" placeholder="********" required value={formData.password} onChange={handleChange} autoComplete="new-password" />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("confirmPassword")}</label>
            <PasswordInput
              name="confirmPassword"
              placeholder="********"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={validations.match && formData.password ? "border-green-500 focus:ring-green-500" : ""}
              autoComplete="new-password"
            />
          </div>

          {/* Password requirements */}
          <div className="text-xs space-y-1 bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold text-gray-500 mb-2">{t("securityReqs")}:</p>
            <RequirementItem fulfilled={validations.length} text={t("minChars")} />
            <RequirementItem fulfilled={validations.uppercase} text={t("uppercase")} />
            <RequirementItem fulfilled={validations.lowercase} text={t("lowercase")} />
            <RequirementItem fulfilled={validations.number} text={t("oneNumber")} />
            <RequirementItem fulfilled={validations.symbol} text={t("oneSymbol")} />
            <RequirementItem fulfilled={validations.match && formData.password.length > 0} text={t("passwordsMatch")} />
          </div>

          {/* Captcha */}
          <div className="flex justify-center my-2">
            <CaptchaErrorBoundary>
              <Suspense fallback={<div className="h-[65px] flex items-center justify-center text-gray-400 text-sm">Loading captcha...</div>}>
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onSuccess={(token: string) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken("")}
                />
              </Suspense>
            </CaptchaErrorBoundary>
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
    <div className={`flex items-center gap-2 transition-colors duration-200 ${fulfilled ? "text-green-600" : "text-red-500"}`}>
      {fulfilled ? (
        <span className="flex items-center justify-center w-4 h-4 bg-green-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </span>
      ) : (
        <span className="flex items-center justify-center w-4 h-4 bg-red-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </span>
      )}
      <span className="font-medium">{text}</span>
    </div>
  );
}
