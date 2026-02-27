"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/marketplace/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch { setStatus("error"); }
    setTimeout(() => setStatus("idle"), 3000);
  };

  return (
    <div>
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider">Newsletter</h3>
      {status === "success" ? (
        <p className="text-green-400 text-sm">Subscribed successfully!</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 text-sm focus:ring-2 focus:ring-white outline-none" />
          <button type="submit" disabled={status === "loading"} className="px-3 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition disabled:opacity-50">
            <Send size={16} />
          </button>
        </form>
      )}
    </div>
  );
}
