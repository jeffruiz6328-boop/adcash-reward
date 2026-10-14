"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Check, Key } from "lucide-react";

export function WithdrawalActions({
  withdrawalId,
  status,
  activationCode,
}: {
  withdrawalId: string;
  status: string;
  activationCode: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(activationCode);
  const [copied, setCopied] = useState(false);

  async function generateCode() {
    setLoading(true);
    const res = await fetch("/api/admin/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId, action: "generateCode" }),
    });
    const data = await res.json();
    if (data.activationCode) {
      setCode(data.activationCode);
    }
    setLoading(false);
    router.refresh();
  }

  async function setStatus(newStatus: string) {
    setLoading(true);
    await fetch("/api/admin/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId, status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  }

  function copyCode() {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="space-y-3 border-t border-zinc-800 pt-4">
      {/* Activation Code */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">Activation Code:</span>
        {code ? (
          <div className="flex items-center gap-2">
            <code className="rounded bg-zinc-950 px-3 py-1.5 font-mono text-sm text-brand-400">
              {code}
            </code>
            <button
              onClick={copyCode}
              className="rounded p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            >
              {copied ? <Check className="h-4 w-4 text-brand-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <button
            onClick={generateCode}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
          >
            <Key className="h-3.5 w-3.5" />
            Generate Code
          </button>
        )}
      </div>

      {/* Status buttons */}
      {status !== "approved" && status !== "rejected" && (
        <div className="flex flex-wrap gap-2">
          {status !== "pending" && (
            <button
              onClick={() => setStatus("pending")}
              disabled={loading}
              className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-500/20 disabled:opacity-50"
            >
              Under Review
            </button>
          )}
          {status !== "processing" && (
            <button
              onClick={() => setStatus("processing")}
              disabled={loading}
              className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
            >
              Processing
            </button>
          )}
          <button
            onClick={() => setStatus("approved")}
            disabled={loading}
            className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            Successful
          </button>
          <button
            onClick={() => setStatus("rejected")}
            disabled={loading}
            className="rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
          >
            Failed
          </button>
        </div>
      )}

      {(status === "approved" || status === "rejected") && (
        <p className="text-xs text-zinc-500">
          This withdrawal is closed ({status === "approved" ? "Successful" : "Failed"}).
        </p>
      )}
    </div>
  );
}
