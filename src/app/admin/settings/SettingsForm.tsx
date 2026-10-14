"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

export function SettingsForm({
  referralReward: initialReferral,
  minWithdrawal: initialMin,
}: {
  referralReward: string;
  minWithdrawal: string;
}) {
  const router = useRouter();
  const [referralReward, setReferralReward] = useState(initialReferral);
  const [minWithdrawal, setMinWithdrawal] = useState(initialMin);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralReward: parseFloat(referralReward),
          minWithdrawal: parseFloat(minWithdrawal),
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        router.refresh();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6"
    >
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Referral Reward */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-200">
          Referral Reward (USD)
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Amount given to a user when someone signs up using their referral code.
        </p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            required
            value={referralReward}
            onChange={(e) => setReferralReward(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-8 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Min Withdrawal */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-200">
          Minimum Withdrawal (USD)
        </label>
        <p className="text-xs text-zinc-500 mb-2">
          Users must reach this balance before they can request a withdrawal.
        </p>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
          <input
            type="number"
            step="0.01"
            min="1"
            max="1000"
            required
            value={minWithdrawal}
            onChange={(e) => setMinWithdrawal(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 pl-8 pr-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-black hover:bg-brand-400 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {loading ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}
