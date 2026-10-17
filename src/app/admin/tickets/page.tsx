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
    orderBy: { createdAt: "desc" },
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
              <p className="text-sm text-zinc-300 whitespace-pre-wrap mb-4">{t.message}</p>
              {t.adminReply && (
                <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm">
                  <div className="text-xs text-blue-400 mb-1">Admin reply</div>
                  <p className="text-zinc-300 whitespace-pre-wrap">{t.adminReply}</p>
                </div>
              )}
              <TicketActions ticketId={t.id} status={t.status} existingReply={t.adminReply} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
