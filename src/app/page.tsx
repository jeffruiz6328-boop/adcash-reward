import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Play, DollarSign, Shield, Zap, Bitcoin, Gift, CreditCard } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-emerald-500/5" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400 mb-6">
            <Zap className="h-4 w-4" />
            Earn real money watching short ads
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Watch Ads.
            <br />
            <span className="text-brand-400">Get Paid.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-zinc-400">
            Join thousands of users who turn a few minutes of their day into real cash.
            Cash out via Bitcoin, PayPal or Amazon Gift Cards once you reach $50.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-black hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/20"
            >
              Start Earning Free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-900 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Play,
                title: "1. Watch & Complete",
                desc: "Watch real video ads and complete tasks, surveys, and offers to earn money.",
              },
              {
                icon: DollarSign,
                title: "2. Earn & Refer",
                desc: "Every action pays you instantly. Invite friends and earn a bonus for each signup.",
              },
              {
                icon: Shield,
                title: "3. Cash Out",
                desc: "Reach the minimum and withdraw via Bitcoin, PayPal or Amazon Gift Card.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payout methods */}
      <section className="border-t border-zinc-900 py-20 bg-zinc-900/30">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Flexible payout options</h2>
          <p className="text-zinc-400 mb-12 max-w-xl mx-auto">
            Choose the method that works best for you. Minimum withdrawal is $50.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Bitcoin, name: "Bitcoin", desc: "Direct to your wallet" },
              { icon: CreditCard, name: "PayPal", desc: "Fast & trusted" },
              { icon: Gift, name: "Amazon Gift Card", desc: "Shop anything you want" },
            ].map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col items-center gap-3"
              >
                <m.icon className="h-8 w-8 text-brand-400" />
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-zinc-500">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-900 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start earning?</h2>
          <p className="text-zinc-400 mb-8">
            Create your free account in under a minute. No credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex rounded-xl bg-brand-500 px-10 py-4 text-lg font-semibold text-black hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/20"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-10">
        <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div>© {new Date().getFullYear()} AdCash Rewards. All rights reserved.</div>
          <div className="flex gap-6">
            <Link href="/support" className="hover:text-zinc-300">
              Contact Support
            </Link>
            <Link href="/login" className="hover:text-zinc-300">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
