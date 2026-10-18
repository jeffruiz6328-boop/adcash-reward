"use client";

import { SessionProvider } from "next-auth/react";
import { BanGuard } from "./BanGuard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BanGuard />
      {children}
    </SessionProvider>
  );
}
