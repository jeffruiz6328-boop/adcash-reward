"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TicketActions({
  ticketId,
  status,
}: {
  ticketId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(newStatus: string) {
    setLoading(true);
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  if (status === "closed") return null;

  return (
    <div className="flex gap-2">
      {status === "open" && (
        <button
          onClick={() => update("replied")}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
        >
          Mark Replied
        </button>
      )}
      <button
        onClick={() => update("closed")}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
      >
        Close
      </button>
    </div>
  );
}
