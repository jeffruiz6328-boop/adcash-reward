import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  Play,
  Wallet,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Eye,
} from "lucide-react";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const [
    totalUsers,
    totalAds,
    pendingWithdrawals,
    openTickets,
    totalEarned,
    totalViews,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.ad.count({ where: { isActive: true } }),
    prisma.withdrawal.count({ where: { status: "pending" } }),
    prisma.supportTicket.count({ where: { status: "open" } }),
    prisma.user.aggregate({ _sum: { totalEarned: true } }),
    prisma.adView.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, balance: true, createdAt: true },
    }),
  ]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-400">Admin Portal</h1>
            <p className="text-zinc-400 mt-1">Manage the platform</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-zinc-400">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="h-5 w-5 text-emerald-400" />
              <span className="text-sm text-zinc-400">Total Ad Views</span>
            </div>
            <div className="text-2xl font-bold">{totalViews}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-brand-400" />
              <span className="text-sm text-zinc-400">Total Paid Out (earned)</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(totalEarned._sum.totalEarned || 0)}
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="h-5 w-5 text-amber-400" />
              <span className="text-sm text-zinc-400">Pending Withdrawals</span>
            </div>
            <div className="text-2xl font-bold">{pendingWithdrawals}</div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { href: "/admin/users", icon: Users, label: "Manage Users", color: "text-blue-400" },
            { href: "/admin/ads", icon: Play, label: "Manage Ads", color: "text-brand-400" },
            {
              href: "/admin/withdrawals",
              icon: Wallet,
              label: "Withdrawals",
              color: "text-amber-400",
              badge: pendingWithdrawals,
            },
            {
              href: "/admin/tickets",
              icon: MessageSquare,
              label: "Support Tickets",
              color: "text-purple-400",
              badge: openTickets,
            },
            {
              href: "/admin/settings",
              icon: DollarSign,
              label: "Settings",
              color: "text-zinc-400",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-zinc-700 transition-colors"
            >
              <item.icon className={`h-6 w-6 ${item.color}`} />
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Recent users */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-brand-400 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-500">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Balance</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-900">
                    <td className="py-3">{u.name || "—"}</td>
                    <td className="py-3 text-zinc-400">{u.email}</td>
                    <td className="py-3">{formatCurrency(u.balance)}</td>
                    <td className="py-3 text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
