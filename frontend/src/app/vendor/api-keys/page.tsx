"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getApiKeyScopes, listApiKeys, createApiKey, revokeApiKey } from "@/services/vendorService";
import { Key, Plus, Trash2 } from "lucide-react";

type ApiKeyRow = { id: number; name: string; scopes: string; lastUsedAt: string | null; createdAt: string };

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const v = t(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export default function VendorApiKeysPage() {
  const t = useTranslations("vendor");
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [scopes, setScopes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createScopes, setCreateScopes] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [newKeyShown, setNewKeyShown] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    const [listRes, scopesRes] = await Promise.all([listApiKeys(), getApiKeyScopes()]);
    if (listRes.success && Array.isArray(listRes.data)) setKeys(listRes.data);
    if (scopesRes.success && Array.isArray(scopesRes.data)) setScopes(scopesRes.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setError("");
    setSuccess("");
    setCreating(true);
    const res = await createApiKey({ name: createName.trim(), scopes: createScopes });
    setCreating(false);
    if (res.success && res.data?.key) {
      setNewKeyShown(res.data.key);
      setSuccess("API key created. Copy it now — it won't be shown again.");
      setCreateName("");
      setCreateScopes([]);
      setShowCreate(false);
      load();
    } else {
      setError(res.message || "Failed to create key");
    }
  };

  const toggleScope = (scope: string) => {
    setCreateScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleRevoke = async (id: number) => {
    if (!confirm("Revoke this API key? It will stop working immediately.")) return;
    setError("");
    const res = await revokeApiKey(id);
    if (res.success) {
      setSuccess("Key revoked.");
      load();
    } else {
      setError(res.message || "Failed to revoke");
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Key className="w-8 h-8" />
        {safeT(t, "apiKeys", "API Keys")}
      </h1>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>}

      {newKeyShown && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-800 mb-2">Your new API key (copy now):</p>
          <code className="block p-2 bg-white rounded text-sm break-all select-all">{newKeyShown}</code>
          <button
            type="button"
            onClick={() => setNewKeyShown(null)}
            className="mt-2 text-sm text-amber-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">API keys</h2>
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 bg-[#065f46] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#054a36]"
          >
            <Plus className="w-4 h-4" />
            Create key
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="p-6 border-b bg-gray-50 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Production API"
                className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scopes</label>
              <div className="flex flex-wrap gap-2">
                {scopes.map((scope) => (
                  <label key={scope} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={createScopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{scope}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="bg-[#065f46] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#054a36] disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        )}

        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Name</th>
              <th className="p-4 font-medium text-gray-500">Scopes</th>
              <th className="p-4 font-medium text-gray-500">Last used</th>
              <th className="p-4 font-medium text-gray-500">Created</th>
              <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No API keys yet. Create one to integrate with our API.</td></tr>
            )}
            {keys.map((k) => (
              <tr key={k.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{k.name}</td>
                <td className="p-4 text-sm text-gray-600">{typeof k.scopes === "string" ? k.scopes : (k as any).scopes?.join?.(", ") ?? "—"}</td>
                <td className="p-4 text-sm">{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString() : "Never"}</td>
                <td className="p-4 text-sm">{k.createdAt ? new Date(k.createdAt).toLocaleString() : "—"}</td>
                <td className="p-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleRevoke(k.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Revoke"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
