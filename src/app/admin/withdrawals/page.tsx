import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { WithdrawalActions } from "./WithdrawalActions";

export default async function AdminWithdrawalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const withdrawals = await prisma.withdrawal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold mt-2">Withdrawal Requests</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Generate activation codes, then mark as Successful or Failed
          </p>
        </div>

        <div className="space-y-4">
          {withdrawals.length === 0 && (
            <p className="text-center text-zinc-500 py-12">No withdrawal requests yet.</p>
          )}
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-semibold">{w.user.name || "—"}</div>
                  <div className="text-sm text-zinc-400">{w.user.email}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {new Date(w.createdAt).toLocaleString()} · {w.method} · {w.details}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{formatCurrency(w.amount)}</div>
                  <span
                    className={`text-xs font-medium capitalize ${
                      w.status === "approved"
                        ? "text-emerald-400"
                        : w.status === "rejected"
                        ? "text-red-400"
                        : w.status === "processing"
                        ? "text-blue-400"
                        : "text-amber-400"
                    }`}
                  >
                    {w.status === "pending"
                      ? "Under Review"
                      : w.status === "processing"
                      ? "Processing"
                      : w.status === "approved"
                      ? "Successful"
                      : "Failed"}
                  </span>
                </div>
              </div>

              <WithdrawalActions
                withdrawalId={w.id}
                status={w.status}
                activationCode={w.activationCode}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
