import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "AdCash Rewards – Watch Ads & Earn Real Money",
  description: "Watch short ads, earn real money, and cash out via Bitcoin, PayPal or Amazon Gift Cards. Minimum withdrawal $50.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
