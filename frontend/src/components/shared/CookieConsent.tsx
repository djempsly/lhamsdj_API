"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setShow(true);
  }, []);

  const accept = (all: boolean) => {
    const consent = { analytics: all, marketing: all, functional: true, date: new Date().toISOString() };
    localStorage.setItem("cookie-consent", JSON.stringify(consent));
    setShow(false);

    try {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/cookie-consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(consent),
      });
    } catch {}
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl">
        <p className="text-sm text-gray-600">
          We use cookies to enhance your experience. By continuing, you agree to our use of cookies.
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => accept(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition">
            Essential Only
          </button>
          <button onClick={() => accept(true)} className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
