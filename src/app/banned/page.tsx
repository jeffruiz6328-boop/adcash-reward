"use client";

import { signOut } from "next-auth/react";
import { ShieldBan } from "lucide-react";

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-zinc-900 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <ShieldBan className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Account Banned</h1>
        <p className="text-zinc-400 text-sm leading-relaxed mb-2">
          Your account has been banned for <strong className="text-zinc-200">unusual activity</strong>.
        </p>
        <p className="text-zinc-500 text-sm mb-8">
          If you believe this is a mistake, contact support from a different account or email.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full rounded-xl bg-zinc-800 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
