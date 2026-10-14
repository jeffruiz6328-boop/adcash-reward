import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { UserActions } from "./UserActions";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      balance: true,
      totalEarned: true,
      isAdmin: true,
      isBanned: true,
      createdAt: true,
      _count: { select: { adViews: true } },
    },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-300">
              ← Back to Admin
            </Link>
            <h1 className="text-2xl font-bold mt-2">Manage Users</h1>
          </div>
          <div className="text-sm text-zinc-400">{users.length} users</div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/50 text-left text-zinc-500">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Balance</th>
                  <th className="px-4 py-3 font-medium">Earned</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-900">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name || "—"}</div>
                      <div className="text-xs text-zinc-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(u.balance)}</td>
                    <td className="px-4 py-3">{formatCurrency(u.totalEarned)}</td>
                    <td className="px-4 py-3">{u._count.adViews}</td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="text-red-400 text-xs font-medium">Banned</span>
                      ) : u.isAdmin ? (
                        <span className="text-amber-400 text-xs font-medium">Admin</span>
                      ) : (
                        <span className="text-emerald-400 text-xs font-medium">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <UserActions
                        userId={u.id}
                        isBanned={u.isBanned}
                        currentBalance={u.balance}
                      />
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
