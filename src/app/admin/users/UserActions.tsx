"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserActions({
  userId,
  isBanned,
  currentBalance,
}: {
  userId: string;
  isBanned: boolean;
  currentBalance: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [amount, setAmount] = useState("");

  async function toggleBan() {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: isBanned ? "unban" : "ban" }),
    });
    setLoading(false);
    router.refresh();
  }

  async function adjustBalance() {
    const num = parseFloat(amount);
    if (isNaN(num)) return;
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action: "adjust", amount: num }),
    });
    setLoading(false);
    setShowAdjust(false);
    setAmount("");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleBan}
        disabled={loading}
        className={`text-xs px-2 py-1 rounded ${
          isBanned
            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
        }`}
      >
        {isBanned ? "Unban" : "Ban"}
      </button>
      <button
        onClick={() => setShowAdjust(!showAdjust)}
        className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
      >
        Adjust $
      </button>
      {showAdjust && (
        <div className="flex items-center gap-1">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="± amount"
            className="w-20 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs"
          />
          <button
            onClick={adjustBalance}
            disabled={loading}
            className="text-xs px-2 py-1 rounded bg-brand-500 text-black"
          >
            Set
          </button>
        </div>
      )}
    </div>
  );
}
