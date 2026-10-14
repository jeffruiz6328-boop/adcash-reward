import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-zinc-500 hover:text-zinc-300">
            ← Back to Admin
          </Link>
          <h1 className="text-2xl font-bold mt-2">Platform Settings</h1>
          <p className="text-zinc-400 mt-1">
            Change key values without editing code
          </p>
        </div>

        <SettingsForm
          referralReward={settingsMap.referralReward || "10"}
          minWithdrawal={settingsMap.minWithdrawal || "50"}
        />
      </main>
    </div>
  );
}
