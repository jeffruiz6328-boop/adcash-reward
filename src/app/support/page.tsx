"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { HeadphonesIcon, Loader2, CheckCircle, Key } from "lucide-react";

interface Reply {
  id: string;
  body: string;
  isAdmin: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  replies: Reply[];
}

export default function SupportPage() {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<string | null>(null);

  function loadTickets() {
    fetch("/api/support")
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets || []))
      .catch(() => {});
  }

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      loadTickets();
    }
  }, [session]);

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
        loadTickets();
      } else {
        setError(data.error || "Failed to send message");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  async function sendUserReply(ticketId: string) {
    const text = replyText[ticketId]?.trim();
    if (!text) return;
    setReplying(ticketId);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, reply: text }),
      });
      if (res.ok) {
        setReplyText((prev) => ({ ...prev, [ticketId]: "" }));
        loadTickets();
      }
    } catch {}
    setReplying(null);
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
            Send a message and chat with support on this page.
          </p>
        </div>

        <Link
          href="/withdraw/activate"
          className="mb-6 flex items-center gap-3 rounded-xl border border-brand-500/30 bg-brand-500/5 px-4 py-3 hover:bg-brand-500/10 transition-colors"
        >
          <Key className="h-5 w-5 text-brand-400 shrink-0" />
          <div>
            <div className="font-medium text-sm">Have an activation code?</div>
            <div className="text-xs text-zinc-500">Enter it here to process your withdrawal</div>
          </div>
        </Link>

        {tickets.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-sm font-medium text-zinc-400">Your conversations</h2>
            {tickets.map((t) => (
              <div key={t.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm">{t.subject}</span>
                  <span className="text-xs text-zinc-500 capitalize">{t.status}</span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2">
                    <div className="text-xs text-zinc-500 mb-1">You</div>
                    <p className="text-sm text-zinc-300">{t.message}</p>
                  </div>
                  {t.replies?.map((r) => (
                    <div
                      key={r.id}
                      className={`rounded-lg border px-3 py-2 ${
                        r.isAdmin
                          ? "bg-blue-500/5 border-blue-500/20"
                          : "bg-zinc-950 border-zinc-800"
                      }`}
                    >
                      <div className={`text-xs mb-1 ${r.isAdmin ? "text-blue-400" : "text-zinc-500"}`}>
                        {r.isAdmin ? "Support" : "You"}
                      </div>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap">{r.body}</p>
                    </div>
                  ))}
                </div>

                {t.status !== "closed" && (
                  <div className="flex gap-2">
                    <input
                      value={replyText[t.id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({ ...prev, [t.id]: e.target.value }))
                      }
                      placeholder="Type a reply…"
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
                    />
                    <button
                      onClick={() => sendUserReply(t.id)}
                      disabled={replying === t.id || !(replyText[t.id] || "").trim()}
                      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-black hover:bg-brand-400 disabled:opacity-40"
                    >
                      {replying === t.id ? "…" : "Reply"}
                    </button>
                  </div>
                )}

                <div className="text-xs text-zinc-600 mt-2">
                  {new Date(t.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {success ? (
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-brand-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Message sent!</h2>
            <p className="text-zinc-400 mb-6">
              Support will reply here. You can also reply back on this page.
            </p>
            <button onClick={() => setSuccess(false)} className="text-sm text-brand-400 hover:underline">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="font-medium">New message</h2>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Subject</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Need activation code"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue…"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-500 py-3 font-semibold text-black hover:bg-brand-400 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending…
                </span>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
