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
  const [reply, setReply] = useState("");
  const [showBox, setShowBox] = useState(false);

  async function sendReply() {
    if (!reply.trim()) return;
    setLoading(true);
    await fetch("/api/admin/tickets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, reply: reply.trim() }),
    });
    setReply("");
    setShowBox(false);
    setLoading(false);
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

  return (
    <div className="space-y-3 border-t border-zinc-800 pt-3 mt-3">
      {status !== "closed" && (
        <>
          {showBox ? (
            <div className="space-y-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Type your reply…"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={sendReply}
                  disabled={loading || !reply.trim()}
                  className="text-xs px-3 py-1.5 rounded bg-brand-500 text-black font-medium hover:bg-brand-400 disabled:opacity-50"
                >
                  {loading ? "Sending…" : "Send Reply"}
                </button>
                <button
                  onClick={() => setShowBox(false)}
                  className="text-xs px-3 py-1.5 rounded bg-zinc-800 text-zinc-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowBox(true)}
              className="text-xs px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            >
              Reply
            </button>
          )}
        </>
      )}

      <div className="flex gap-2">
        {status !== "closed" && (
          <button
            onClick={() => update("closed")}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          >
            Close ticket
          </button>
        )}
        {status === "closed" && (
          <button
            onClick={() => update("open")}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          >
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}
