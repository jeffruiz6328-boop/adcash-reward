import Link from "next/link";
import { Navbar } from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <h1 className="text-6xl font-bold text-zinc-700">404</h1>
        <p className="mt-4 text-xl text-zinc-400">Page not found</p>
        <Link
          href="/"
          className="mt-8 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-black hover:bg-brand-400"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
