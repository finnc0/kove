"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { KoveLogo } from "@/components/KoveLogo";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1100px] items-center justify-between px-6">
        <KoveLogo className="h-6 w-auto" />

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            )}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-white text-zinc-950 hover:bg-zinc-100"
            )}
          >
            Get started
          </Link>
        </div>

        <button
          className="rounded-md p-2 text-zinc-400 hover:text-white md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-b border-white/[0.06] bg-zinc-950 px-6 py-4 md:hidden flex flex-col gap-2">
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "justify-start text-zinc-400 hover:text-white"
            )}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "sm" }),
              "justify-start bg-white text-zinc-950 hover:bg-zinc-100"
            )}
          >
            Get started
          </Link>
        </div>
      )}
    </nav>
  );
}
