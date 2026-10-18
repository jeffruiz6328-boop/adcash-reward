"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function BanGuard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "authenticated") return;
    if (pathname === "/banned" || pathname?.startsWith("/login") || pathname?.startsWith("/register")) return;

    // From session (JWT re-check)
    if ((session?.user as any)?.isBanned) {
      router.replace("/banned");
      return;
    }

    // Extra live check from DB
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => {
        if (d.isBanned) {
          update(); // refresh JWT
          router.replace("/banned");
        }
      })
      .catch(() => {});
  }, [session, status, pathname, router, update]);

  return null;
}
