"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Play, LayoutDashboard, Wallet, HeadphonesIcon, LogOut, Shield, Menu, X, ClipboardList } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = session
    ? [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/watch", label: "Watch Ads", icon: Play },
        { href: "/tasks", label: "Tasks", icon: ClipboardList },
        { href: "/withdraw", label: "Withdraw", icon: Wallet },
        { href: "/support", label: "Support", icon: HeadphonesIcon },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-black">
            <Play className="h-4 w-4 fill-current" />
          </span>
          AdCash<span className="text-brand-400">Rewards</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}

          {session?.user?.isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-amber-500/80 hover:bg-amber-500/10"
              )}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}

          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="ml-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-black hover:bg-brand-400 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  pathname === link.href ? "bg-zinc-800 text-white" : "text-zinc-400"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
            {session?.user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-amber-400"
              >
                <Shield className="h-4 w-4" />
                Admin Portal
              </Link>
            )}
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-zinc-400"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-2.5 text-sm">
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-lg bg-brand-500 px-3 py-2.5 text-center text-sm font-semibold text-black"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
