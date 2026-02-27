"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function safeT(t: (key: string) => string, key: string, fallback: string): string {
  try {
    const v = t(key);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

type VendorProfile = {
  businessName: string;
  description: string | null;
  logo: string | null;
  slug: string;
};

export default function VendorProfilePage() {
  const t = useTranslations("vendor");
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/vendors/me`, {
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          setProfile(p);
          setStoreName(p.businessName || "");
          setDescription(p.description || "");
          setLogoUrl(p.logo || "");
        } else {
          setError(json.message || "Failed to load profile");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/vendors/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          description,
          logoUrl: logoUrl || undefined,
        }),
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setSuccess(true);
        setProfile(json.data);
      } else {
        setError(json.message || "Failed to update");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-10 w-10 border-2 border-[#065f46] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {safeT(t, "editProfile", "Edit Profile")}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
            {safeT(t, "profileUpdated", "Profile updated successfully")}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {safeT(t, "storeName", "Store Name")}
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
            minLength={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {safeT(t, "storeDescription", "Description")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo URL
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="py-2 px-6 bg-[#065f46] text-white font-medium rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? safeT(t, "saving", "Saving...") : safeT(t, "saveProfile", "Save Profile")}
        </button>
      </form>
    </div>
  );
}
