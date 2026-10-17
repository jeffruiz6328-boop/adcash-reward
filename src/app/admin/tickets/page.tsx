import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { TicketActions } from "./TicketActions";

export default async function AdminTicketsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const tickets = await prisma.supportTicket.findMany({
    include: {
      replies: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold mt-2">Support Tickets</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Reply to any ticket. Users can reply back on their Support page.
          </p>
        </div>

        <div className="space-y-4">
          {tickets.length === 0 && (
            <p className="text-center text-zinc-500 py-12">No tickets yet.</p>
          )}
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-semibold">{t.subject}</div>
                  <div className="text-sm text-zinc-400">
                    {t.name} &lt;{t.email}&gt;
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium capitalize px-2 py-0.5 rounded ${
                      t.status === "open"
                        ? "bg-amber-500/10 text-amber-400"
                        : t.status === "replied"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(t.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Conversation thread */}
              <div className="space-y-2 mb-2">
                <div className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2">
                  <div className="text-xs text-zinc-500 mb-1">User</div>
                  <p className="text-sm text-zinc-300 whitespace-pre-wrap">{t.message}</p>
                </div>
                {t.replies.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-lg border px-3 py-2 ${
                      r.isAdmin
                        ? "bg-blue-500/5 border-blue-500/20 ml-4"
                        : "bg-zinc-950 border-zinc-800 mr-4"
                    }`}
                  >
                    <div className={`text-xs mb-1 ${r.isAdmin ? "text-blue-400" : "text-zinc-500"}`}>
                      {r.isAdmin ? "You (Admin)" : "User"} · {new Date(r.createdAt).toLocaleString()}
                    </div>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap">{r.body}</p>
                  </div>
                ))}
              </div>

              <TicketActions ticketId={t.id} status={t.status} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
