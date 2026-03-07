"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getNewsletterSubscribers } from "@/services/adminService";
import { Mail } from "lucide-react";

type Subscriber = { id: number; email: string; name: string | null; isActive: boolean; locale: string; createdAt?: string };

export default function AdminNewsletterPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [list, setList] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await getNewsletterSubscribers();
      if (res.success && Array.isArray(res.data)) setList(res.data);
      else setError(res.message || "Failed to load");
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Mail className="w-8 h-8" />
        Newsletter subscribers
      </h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">{tCommon("email")}</th>
              <th className="p-4 font-medium text-gray-500">{tCommon("name")}</th>
              <th className="p-4 font-medium text-gray-500">Locale</th>
              <th className="p-4 font-medium text-gray-500">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">{tCommon("loading")}</td></tr>
            )}
            {!loading && list.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{s.email}</td>
                <td className="p-4">{s.name ?? "—"}</td>
                <td className="p-4">{s.locale}</td>
                <td className="p-4">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {!loading && list.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No subscribers yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
