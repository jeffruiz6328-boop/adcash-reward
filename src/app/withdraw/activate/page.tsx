"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Key, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ActivateWithdrawalPage() {
  const { status } = useSession();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/withdraw/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Invalid code");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-16">
        {success ? (
          <div className="rounded-2xl border border-blue-500/30 bg-zinc-900/50 p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Withdrawal Processing</h1>
            <p className="text-zinc-400 leading-relaxed mb-6">
              Your activation code was accepted. Your withdrawal is now being processed.
              You will be notified when the transfer is completed.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex rounded-xl bg-brand-500 px-6 py-3 font-semibold text-black hover:bg-brand-400"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10">
              <Key className="h-8 w-8 text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">Enter Activation Code</h1>
            <p className="text-sm text-zinc-400 text-center mb-6">
              Enter the activation code you received from support to move your withdrawal to processing.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Activation Code
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. K7M2X9P4Q8R3N5B"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-center text-lg font-mono tracking-widest outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-black hover:bg-brand-400 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking…
                  </span>
                ) : (
                  "Activate & Process"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-zinc-500">
              Don&apos;t have a code?{" "}
              <Link href="/support" className="text-brand-400 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
