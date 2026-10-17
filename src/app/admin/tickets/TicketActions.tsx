"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TicketActions({
  ticketId,
  status,
  existingReply,
}: {
  ticketId: string;
  status: string;
  existingReply?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState(existingReply || "");
  const [showReply, setShowReply] = useState(!!existingReply);

  async function sendReply() {
    if (!reply.trim()) return;
    setLoading(true);
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, adminReply: reply.trim(), status: "replied" }),
    });
    setLoading(false);
    setShowReply(true);
    router.refresh();
  }

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

  if (status === "closed") {
    return existingReply ? (
      <div className="mt-3 rounded-lg bg-zinc-950 border border-zinc-800 p-3 text-sm text-zinc-400">
        <span className="text-xs text-zinc-500">Your reply: </span>
        {existingReply}
      </div>
    ) : null;
  }

  return (
    <div className="space-y-3">
      {showReply || existingReply ? (
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3">
          <label className="text-xs text-blue-400 mb-1 block">Admin reply</label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
            placeholder="Type your reply to the user…"
          />
          <button
            onClick={sendReply}
            disabled={loading || !reply.trim()}
            className="mt-2 text-xs px-3 py-1.5 rounded bg-brand-500 text-black font-medium hover:bg-brand-400 disabled:opacity-50"
          >
            {loading ? "Saving…" : existingReply ? "Update Reply" : "Send Reply"}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowReply(true)}
          className="text-xs px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
        >
          Reply to user
        </button>
      )}

      <div className="flex gap-2">
        {status === "open" && !showReply && (
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
    </div>
  );
}
