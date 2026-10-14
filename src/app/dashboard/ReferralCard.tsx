"use client";

import { useState } from "react";
import { Users, Copy, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function ReferralCard({
  referralCode,
  referralCount,
  referrals,
  rewardAmount = 10,
}: {
  referralCode: string;
  referralCount: number;
  referrals: { id: string; name: string | null; email: string; createdAt: Date }[];
  rewardAmount?: number;
}) {
  const [copied, setCopied] = useState(false);

  const link = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `/register?ref=${referralCode}`;

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-transparent p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">
              Invite Friends & Earn {formatCurrency(rewardAmount)}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Share your link. When someone signs up with your code, you instantly get{" "}
              <strong className="text-brand-400">{formatCurrency(rewardAmount)}</strong> added to your balance.
            </p>
            <div className="mt-3 flex items-center gap-3 text-sm">
              <span className="text-zinc-500">Your code:</span>
              <code className="rounded bg-zinc-900 px-2 py-1 font-mono text-brand-400">{referralCode}</code>
              <span className="text-zinc-500">·</span>
              <span className="text-zinc-300">{referralCount} referral{referralCount !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        <button
          onClick={copyLink}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-400 transition-colors shrink-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Invite Link"}
        </button>
      </div>

      {referrals.length > 0 && (
        <div className="mt-5 border-t border-zinc-800 pt-4">
          <div className="text-xs text-zinc-500 mb-2">Recent referrals</div>
          <div className="flex flex-wrap gap-2">
            {referrals.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded-lg bg-zinc-900/80 px-3 py-1.5 text-xs">
                {r.name || r.email.split("@")[0]} · {new Date(r.createdAt).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
