"use client";

import { useTranslations } from "next-intl";
import NewsletterSignup from "@/components/shared/NewsletterSignup";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-blue-900 text-white py-8 mt-auto w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-center md:text-left">© {new Date().getFullYear()} LhamsDJ Store. {t("rights")}</p>
          </div>
          <div className="shrink-0">
            <NewsletterSignup />
          </div>
        </div>
      </div>
    </footer>
  );
}