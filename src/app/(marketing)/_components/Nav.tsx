"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { KoveLogo } from "@/components/KoveLogo";
import { cn } from "@/lib/utils";

interface NavProps {
  isSignedIn?: boolean;
}

export function Nav({ isSignedIn }: NavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-14 flex items-center transition-all duration-300",
        scrolled &&
          "bg-zinc-950/80 backdrop-blur-md border-b border-white/[0.06]",
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Kove Labs">
          <KoveLogo className="h-6 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Sign out
              </button>
              <Link
                href="/dashboard"
                className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
