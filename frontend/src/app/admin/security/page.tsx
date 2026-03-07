"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSecurityDashboard } from "@/services/adminService";
import { Shield, AlertTriangle, LogIn, Lock, Users, FileText } from "lucide-react";

type SecurityData = {
  last24h: { loginFailed: number; loginSuccess: number; accountLocked: number };
  activeSessions: number;
  pendingKyc: number;
  recentAudit: Array<{ id: number; action: string; entity: string; entityId: string | null; userId: number | null; ip: string | null; createdAt: string }>;
};

export default function AdminSecurityPage() {
  const t = useTranslations("admin");
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await getSecurityDashboard();
      if (res.success && res.data) setData(res.data);
      else setError(res.message || "Failed to load");
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-8">{t("loadingStats")}</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!data) return null;

  const { last24h, activeSessions, pendingKyc, recentAudit } = data;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Shield className="w-8 h-8" />
        Security
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-sm font-medium text-gray-500">Last 24h</span>
          </div>
          <p className="text-2xl font-bold mt-2">{last24h.loginFailed}</p>
          <p className="text-sm text-gray-500">Failed logins</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-green-600">
            <LogIn className="w-6 h-6" />
            <span className="text-sm font-medium text-gray-500">Last 24h</span>
          </div>
          <p className="text-2xl font-bold mt-2">{last24h.loginSuccess}</p>
          <p className="text-sm text-gray-500">Successful logins</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-amber-600">
            <Lock className="w-6 h-6" />
            <span className="text-sm font-medium text-gray-500">Last 24h</span>
          </div>
          <p className="text-2xl font-bold mt-2">{last24h.accountLocked}</p>
          <p className="text-sm text-gray-500">Accounts locked</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-blue-600">
            <Users className="w-6 h-6" />
            <span className="text-sm font-medium text-gray-500">Current</span>
          </div>
          <p className="text-2xl font-bold mt-2">{activeSessions}</p>
          <p className="text-sm text-gray-500">Active sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pending KYC
          </h2>
          <p className="text-3xl font-bold text-amber-600">{pendingKyc}</p>
          <p className="text-sm text-gray-500 mt-1">Vendors awaiting verification. Review in Vendors.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <h2 className="text-lg font-bold p-4 border-b flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Recent audit (last 24h)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 font-medium text-gray-500">Time</th>
                <th className="p-3 font-medium text-gray-500">Action</th>
                <th className="p-3 font-medium text-gray-500">Entity</th>
                <th className="p-3 font-medium text-gray-500">User ID</th>
                <th className="p-3 font-medium text-gray-500">IP</th>
              </tr>
            </thead>
            <tbody>
              {recentAudit.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-gray-500">{t("noRecords")}</td></tr>
              )}
              {recentAudit.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">{new Date(row.createdAt).toLocaleString()}</td>
                  <td className="p-3 font-medium">{row.action}</td>
                  <td className="p-3">{row.entity}{row.entityId != null ? ` #${row.entityId}` : ""}</td>
                  <td className="p-3">{row.userId ?? "—"}</td>
                  <td className="p-3 text-gray-500">{row.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
