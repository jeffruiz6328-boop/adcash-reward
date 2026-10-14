import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import Link from "next/link";
import { Clock, HeadphonesIcon, LayoutDashboard, Key } from "lucide-react";

export default async function WithdrawSuccessPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <Clock className="h-8 w-8 text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold mb-3">Withdrawal Under Review</h1>

          <p className="text-zinc-400 leading-relaxed mb-6">
            Your withdrawal request has been received and is currently being reviewed by our team.
            This usually takes <strong className="text-zinc-200">24–48 hours</strong>.
          </p>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 mb-6 text-left text-sm text-zinc-400">
            For further assistance or to check the status of your request, please contact our support team.
            When you receive an activation code, enter it below to move your withdrawal to processing.
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/withdraw/activate"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-black hover:bg-brand-400 transition-colors"
            >
              <Key className="h-4 w-4" />
              Enter Activation Code
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              <HeadphonesIcon className="h-4 w-4" />
              Contact Support
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2 text-sm text-zinc-500 hover:text-zinc-300"
            >
              <LayoutDashboard className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
