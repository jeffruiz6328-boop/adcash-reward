import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, Eye, Wallet, Users, Copy } from "lucide-react";
import Link from "next/link";
import { ReferralCard } from "./ReferralCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      adViews: {
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { ad: true },
      },
      taskCompletions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { task: true },
      },
      withdrawals: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      referrals: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
    },
  });

  if (!user) redirect("/login");

  const totalViews = await prisma.adView.count({ where: { userId: user.id } });
  const totalTasks = await prisma.taskCompletion.count({ where: { userId: user.id } });

  const referralSetting = await prisma.setting.findUnique({ where: { key: "referralReward" } });
  const referralReward = referralSetting ? parseFloat(referralSetting.value) : 10;

  const minSetting = await prisma.setting.findUnique({ where: { key: "minWithdrawal" } });
  const minWithdrawal = minSetting ? parseFloat(minSetting.value) : 50;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Hey, {user.name || "there"} 👋</h1>
          <p className="text-zinc-400 mt-1">Here&apos;s your earning overview</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-sm text-zinc-400">Current Balance</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(user.balance)}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-sm text-zinc-400">Total Earned</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(user.totalEarned)}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Eye className="h-5 w-5" />
              </div>
              <span className="text-sm text-zinc-400">Ads + Tasks</span>
            </div>
            <div className="text-2xl font-bold">{totalViews + totalTasks}</div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-sm text-zinc-400">Min. Withdrawal</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(minWithdrawal)}</div>
            <div className="mt-1 text-xs text-zinc-500">
              {user.balance >= minWithdrawal ? (
                <Link href="/withdraw" className="text-brand-400 hover:underline">
                  Ready to cash out →
                </Link>
              ) : (
                `${formatCurrency(minWithdrawal - user.balance)} more needed`
              )}
            </div>
          </div>
        </div>

        {/* Referral Card */}
        <ReferralCard
          referralCode={user.referralCode}
          referralCount={user.referrals.length}
          referrals={user.referrals}
          rewardAmount={referralReward}
        />

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Recent activity */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="font-semibold mb-4">Recent Activity</h2>
            {user.adViews.length === 0 && user.taskCompletions.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No activity yet.{" "}
                <Link href="/watch" className="text-brand-400 hover:underline">
                  Watch ads
                </Link>{" "}
                or{" "}
                <Link href="/tasks" className="text-brand-400 hover:underline">
                  complete tasks
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {[...user.adViews.map((v) => ({
                  id: v.id,
                  title: v.ad.title,
                  reward: v.reward,
                  date: v.createdAt,
                  type: "Ad",
                })), ...user.taskCompletions.map((t) => ({
                  id: t.id,
                  title: t.task.title,
                  reward: t.reward,
                  date: t.createdAt,
                  type: "Task",
                }))]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 8)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg bg-zinc-950/50 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-zinc-500">
                          {item.type} · {new Date(item.date).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-brand-400">
                        +{formatCurrency(item.reward)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Recent withdrawals */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Recent Withdrawals</h2>
              <Link href="/withdraw" className="text-sm text-brand-400 hover:underline">
                Request new
              </Link>
            </div>
            {user.withdrawals.length === 0 ? (
              <p className="text-sm text-zinc-500">No withdrawals yet.</p>
            ) : (
              <div className="space-y-3">
                {user.withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-950/50 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium capitalize">{w.method}</div>
                      <div className="text-xs text-zinc-500">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{formatCurrency(w.amount)}</div>
                      <div
                        className={`text-xs capitalize ${
                          w.status === "approved"
                            ? "text-emerald-400"
                            : w.status === "rejected"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {w.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/watch"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-black hover:bg-brand-400 transition-colors"
          >
            Watch Ads
          </Link>
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            Complete Tasks
          </Link>
        </div>
      </main>
    </div>
  );
}
