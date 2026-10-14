import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { AdForm } from "./AdForm";
import { AdToggle } from "./AdToggle";

export default async function AdminAdsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const ads = await prisma.ad.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { views: true } } },
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold mt-2">Manage Ads</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AdForm />
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/50 text-left text-zinc-500">
                    <th className="px-4 py-3 font-medium">Ad</th>
                    <th className="px-4 py-3 font-medium">Reward</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Views</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr key={ad.id} className="border-b border-zinc-900">
                      <td className="px-4 py-3">
                        <div className="font-medium">{ad.title}</div>
                        <div className="text-xs text-zinc-500 line-clamp-1">
                          {ad.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-brand-400">
                        {formatCurrency(ad.reward)}
                      </td>
                      <td className="px-4 py-3">{ad.duration}s</td>
                      <td className="px-4 py-3">{ad._count.views}</td>
                      <td className="px-4 py-3">
                        <AdToggle adId={ad.id} isActive={ad.isActive} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
