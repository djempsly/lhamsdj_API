"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    
    <footer className="bg-blue-900 text-white py-8 mt-auto w-full">
      <div className="container mx-auto px-4 text-center text-20">
        <p>© {new Date().getFullYear()} LhamsDJ Store. {t("rights")}</p>
      </div>

    </footer>
  );
}