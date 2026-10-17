"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { Bitcoin, CreditCard, Gift, Loader2, AlertCircle } from "lucide-react";

const METHODS = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    icon: Bitcoin,
    placeholder: "Your BTC wallet address",
    hint: "We send to the address you provide. Double-check it!",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: CreditCard,
    placeholder: "Your PayPal email",
    hint: "Must match the email on your PayPal account.",
  },
  {
    id: "amazon",
    name: "Amazon Gift Card",
    icon: Gift,
    placeholder: "Email for gift card delivery",
    hint: "Amazon gift card will be sent to this email.",
  },
];

export default function WithdrawPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [minWithdrawal, setMinWithdrawal] = useState(50);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bitcoin");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/withdraw")
        .then((r) => r.json())
        .then((data) => {
          setBalance(data.balance || 0);
          setMinWithdrawal(data.minWithdrawal || 50);
          setFetching(false);
        })
        .catch(() => setFetching(false));
    }
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount < minWithdrawal) {
      setError(`Minimum withdrawal is $${minWithdrawal}`);
      return;
    }
    if (numAmount > balance) {
      setError("Amount exceeds your balance");
      return;
    }
    if (!details.trim()) {
      setError("Please provide payment details");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount, method, details }),
      });
      const data = await res.json();
      if (res.ok) {
        // Redirect to the under-review page
        router.push("/withdraw/success");
      } else {
        setError(data.error || "Request failed");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  if (status === "loading" || fetching) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        </div>
      </div>
    );
  }

  const selected = METHODS.find((m) => m.id === method)!;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Withdraw Earnings</h1>
          <p className="text-zinc-400 mt-1">
            Cash out once you reach the ${minWithdrawal} minimum.
          </p>
        </div>

        <Link
          href="/withdraw/activate"
          className="mb-6 flex items-center gap-3 rounded-xl border border-brand-500/30 bg-brand-500/5 px-4 py-3 hover:bg-brand-500/10 transition-colors"
        >
          <span className="text-brand-400 font-medium text-sm">Have an activation code?</span>
          <span className="text-xs text-zinc-500">Enter it here to process your withdrawal →</span>
        </Link>

        <div className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <div className="text-sm text-zinc-400 mb-1">Available Balance</div>
          <div className="text-3xl font-bold text-brand-400">{formatCurrency(balance)}</div>
          {balance < minWithdrawal && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-amber-400">
              <AlertCircle className="h-4 w-4" />
              You need {formatCurrency(minWithdrawal - balance)} more to withdraw
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-6"
        >
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-3 block text-sm font-medium">Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
                    method === m.id
                      ? "border-brand-500 bg-brand-500/10 text-brand-400"
                      : "border-zinc-700 hover:border-zinc-600 text-zinc-400"
                  }`}
                >
                  <m.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Amount (USD)</label>
            <input
              type="number"
              step="0.01"
              min={minWithdrawal}
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min $${minWithdrawal}`}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              disabled={balance < minWithdrawal}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              {selected.name} Details
            </label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={selected.placeholder}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              disabled={balance < minWithdrawal}
            />
            <p className="mt-1.5 text-xs text-zinc-500">{selected.hint}</p>
          </div>

          <button
            type="submit"
            disabled={loading || balance < minWithdrawal}
            className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-black hover:bg-brand-400 disabled:opacity-40 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </span>
            ) : (
              "Request Withdrawal"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
