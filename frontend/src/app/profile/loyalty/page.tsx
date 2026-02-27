"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Star, Trophy, Copy, Check, Gift } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type LoyaltyProfile = {
  points: number;
  tier: string;
  tierProgress: number;
  nextTier: string;
  pointsToNextTier: number;
  referralCode: string;
};

type HistoryEntry = {
  id: number;
  type: string;
  points: number;
  description: string;
  createdAt: string;
};

const tierColors: Record<string, { bg: string; text: string; badge: string }> = {
  BRONZE: { bg: "bg-orange-50", text: "text-orange-800", badge: "bg-orange-100 border-orange-200" },
  SILVER: { bg: "bg-gray-50", text: "text-gray-800", badge: "bg-gray-100 border-gray-200" },
  GOLD: { bg: "bg-yellow-50", text: "text-yellow-800", badge: "bg-yellow-100 border-yellow-200" },
  PLATINUM: { bg: "bg-purple-50", text: "text-purple-800", badge: "bg-purple-100 border-purple-200" },
};

export default function UserLoyaltyPage() {
  const t = useTranslations("profile");
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [profileRes, historyRes] = await Promise.all([
        fetch(`${API_URL}/marketplace/loyalty/profile`, { credentials: "include" }),
        fetch(`${API_URL}/marketplace/loyalty/history`, { credentials: "include" }),
      ]);
      const [profileData, historyData] = await Promise.all([profileRes.json(), historyRes.json()]);
      if (profileData.success) setProfile(profileData.data);
      if (historyData.success) setHistory(Array.isArray(historyData.data) ? historyData.data : []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const copyReferralCode = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateReferralCode = async () => {
    try {
      const res = await fetch(`${API_URL}/marketplace/loyalty/referral`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) load();
    } catch { /* empty */ }
  };

  const handleRedeem = async () => {
    if (!redeemAmount || Number(redeemAmount) <= 0) return;
    setRedeeming(true);
    try {
      const res = await fetch(`${API_URL}/marketplace/loyalty/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ points: Number(redeemAmount) }),
      });
      const data = await res.json();
      if (data.success) {
        setRedeemAmount("");
        load();
      } else {
        alert(data.message || "Error redeeming points");
      }
    } catch { /* empty */ }
    setRedeeming(false);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  const tier = profile?.tier || "BRONZE";
  const colors = tierColors[tier] || tierColors.BRONZE;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/profile" className="text-gray-500 hover:text-black">
          <ArrowLeft />
        </Link>
        <h1 className="text-2xl font-bold">Loyalty Program</h1>
      </div>

      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${colors.bg} rounded-xl border p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 ${colors.badge} border rounded-full`}>
                <Trophy className={colors.text} size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Tier</p>
                <p className={`text-2xl font-bold ${colors.text}`}>{tier}</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress to {profile.nextTier || "Max"}</span>
                <span className="font-medium">{Math.round(profile.tierProgress)}%</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-3">
                <div
                  className="bg-black rounded-full h-3 transition-all"
                  style={{ width: `${Math.min(profile.tierProgress, 100)}%` }}
                />
              </div>
              {profile.pointsToNextTier > 0 && (
                <p className="text-xs text-gray-500 mt-1">{profile.pointsToNextTier} points to next tier</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-50 rounded-full">
                <Star className="text-yellow-600" size={28} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Points</p>
                <p className="text-3xl font-bold">{profile.points.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={profile.points}
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                placeholder="Points to redeem"
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={handleRedeem}
                disabled={redeeming || !redeemAmount || Number(redeemAmount) > profile.points}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {redeeming ? "..." : "Redeem"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 mb-8">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Gift size={20} /> Referral Program
        </h2>
        {profile?.referralCode ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-wider">
              {profile.referralCode}
            </div>
            <button
              onClick={copyReferralCode}
              className="px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-3">Generate your referral code to earn bonus points</p>
            <button onClick={generateReferralCode} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
              Generate Code
            </button>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-3">Share your code with friends. You both earn points when they make their first purchase.</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="font-bold text-lg">Points History</h2>
        </div>
        <div className="divide-y">
          {history.length === 0 ? (
            <p className="p-6 text-center text-gray-400">No activity yet</p>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-bold ${entry.points > 0 ? "text-green-600" : "text-red-600"}`}>
                  {entry.points > 0 ? "+" : ""}{entry.points}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
