"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HeadphonesIcon, Loader2, CheckCircle, Mail, MessageSquare } from "lucide-react";

export default function SupportPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setSubject("");
        setMessage("");
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400">
            <HeadphonesIcon className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Contact Support</h1>
          <p className="text-zinc-400 mt-2">
            Have a question or issue? We usually reply within 24 hours.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-brand-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Message sent!</h2>
            <p className="text-zinc-400 mb-6">
              Thanks for reaching out. Our team will get back to you soon at the email you provided.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="text-sm text-brand-400 hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-5"
          >
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Subject
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Withdrawal question, Account issue…"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Message
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question in detail…"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-black hover:bg-brand-400 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}

        {/* Extra contact info */}
        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-center">
          <Mail className="mx-auto h-6 w-6 text-zinc-500 mb-3" />
          <p className="text-sm text-zinc-400">
            Prefer email? Reach us directly at{" "}
            <a href="mailto:support@adcashrewards.com" className="text-brand-400 hover:underline">
              support@adcashrewards.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
