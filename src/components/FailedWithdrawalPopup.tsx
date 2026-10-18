"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, AlertTriangle, HeadphonesIcon } from "lucide-react";

interface FailedItem {
  id: string;
  amount: number;
  method: string;
  updatedAt: string;
}

export function FailedWithdrawalPopup() {
  const [failed, setFailed] = useState<FailedItem | null>(null);

  useEffect(() => {
    fetch("/api/withdrawals/failed")
      .then((r) => r.json())
      .then((data) => {
        if (data.failed) {
          const key = "seen_failed_" + data.failed.id;
          if (typeof window !== "undefined" && !localStorage.getItem(key)) {
            setFailed(data.failed);
          }
        }
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    if (failed && typeof window !== "undefined") {
      localStorage.setItem("seen_failed_" + failed.id, "1");
    }
    setFailed(null);
  }

  if (!failed) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 text-zinc-500 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>

        <h2 className="text-center text-xl font-bold text-white mb-2">
          Withdrawal Failed
        </h2>
        <p className="text-center text-zinc-400 text-sm mb-6 leading-relaxed">
          Your withdrawal request could not be completed.
          Please contact support for more information.
        </p>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 mb-6 text-sm text-zinc-400 text-center">
          Amount: <span className="text-white font-medium">${Number(failed.amount).toFixed(2)}</span>
          {" · "}
          Method: <span className="text-white font-medium capitalize">{failed.method}</span>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/support"
            onClick={dismiss}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-black hover:bg-brand-400"
          >
            <HeadphonesIcon className="h-4 w-4" />
            Contact Support
          </Link>
          <button
            onClick={dismiss}
            className="rounded-xl border border-zinc-700 py-3 text-sm text-zinc-400 hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
