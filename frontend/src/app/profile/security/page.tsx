"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { changeUserPassword, getActiveSessions, revokeSession, exportMyData } from "@/services/authService";
import Link from "next/link";
import { ArrowLeft, Lock, Monitor, Download, LogOut } from "lucide-react";
import PasswordInput from "@/components/ui/PasswordInput";

type Session = { id: number; ip: string | null; userAgent: string | null; lastActive: string; createdAt: string };

export default function SecurityPage() {
  const t = useTranslations("profile");
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmNew: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState("");

  useEffect(() => {
    (async () => {
      const res = await getActiveSessions();
      if (res.success && Array.isArray(res.data)) setSessions(res.data);
      setSessionsLoading(false);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword !== formData.confirmNew) {
      setError(t("passwordsMismatch"));
      return;
    }

    setLoading(true);
    const res = await changeUserPassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
    setLoading(false);

    if (res.success) {
      setSuccess(t("passwordUpdated"));
      setFormData({ currentPassword: "", newPassword: "", confirmNew: "" });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="text-gray-500 hover:text-black">
          <ArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold">{t("security")}</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("changePassword")}</h2>
            <p className="text-gray-500 text-sm">{t("changePasswordDesc")}</p>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("currentPassword")}</label>
            {/* <input
              type="password"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            /> */}
            <PasswordInput
              required
              value={formData.currentPassword}
              onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("newPassword")}</label>
            {/* <input
              type="password"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            /> */}

             <PasswordInput
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            />
            <p className="text-xs text-gray-400 mt-1">{t("passwordHint")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("confirmNewPassword")}</label>
            {/* <input
              type="password"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
              value={formData.confirmNew}
              onChange={(e) => setFormData({...formData, confirmNew: e.target.value})}
            /> */}

             <PasswordInput
              required
              value={formData.confirmNew}
              onChange={(e) => setFormData({...formData, confirmNew: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? t("updating") : t("updatePassword")}
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
            <Monitor size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("activeSessions")}</h2>
            <p className="text-gray-500 text-sm">{t("activeSessionsDesc")}</p>
          </div>
        </div>
        {sessionsLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">{t("noSessions")}</p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="text-sm">
                  <p className="font-medium">{s.userAgent || "Unknown device"}</p>
                  <p className="text-gray-500">{s.ip || "—"} · Last active: {new Date(s.lastActive).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await revokeSession(s.id);
                    if (res.success) {
                      setSessions((prev) => prev.filter((x) => x.id !== s.id));
                      setSuccess(t("sessionRevoked"));
                    } else setError(res.message || "Failed");
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded flex items-center gap-1"
                >
                  <LogOut size={16} />
                  {t("revokeSession")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 mt-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
            <Download size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("exportMyData")}</h2>
            <p className="text-gray-500 text-sm">{t("exportMyDataDesc")}</p>
          </div>
        </div>
        {exportSuccess && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded text-sm">{exportSuccess}</div>}
        <button
          type="button"
          disabled={exportLoading}
          onClick={async () => {
            setExportLoading(true);
            setExportSuccess("");
            const res = await exportMyData();
            setExportLoading(false);
            if (res.success && res.data) {
              const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              setExportSuccess(t("dataExported"));
            } else {
              setError(res.message || "Export failed");
            }
          }}
          className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          <Download size={18} />
          {exportLoading ? "Preparing..." : t("downloadData")}
        </button>
      </div>
    </div>
  );
}