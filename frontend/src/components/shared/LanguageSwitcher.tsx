"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

const localeLabels: Record<string, string> = {
  en: "EN",
  fr: "FR",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const next = locale === "en" ? "fr" : "en";
    startTransition(() => {
      document.cookie = `locale=${next};path=/;max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="flex items-center gap-1 px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition disabled:opacity-50"
      title={locale === "en" ? "Switch to French" : "Passer en anglais"}
    >
      <Globe size={16} />
      <span className="font-medium">{localeLabels[locale]}</span>
    </button>
  );
}
