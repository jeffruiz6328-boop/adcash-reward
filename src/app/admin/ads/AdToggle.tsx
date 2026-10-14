"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdToggle({ adId, isActive }: { adId: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch("/api/admin/ads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adId, isActive: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs px-2 py-1 rounded font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-zinc-800 text-zinc-500"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </button>
  );
}
