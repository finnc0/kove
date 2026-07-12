"use client";

import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import { KoveLogo } from "@/components/KoveLogo";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function TopNav() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 h-14 bg-zinc-950 border-b border-white/[0.06] flex items-center justify-between px-8">
      <Link href="/dashboard" aria-label="Kove Labs">
        <KoveLogo className="h-6 w-auto" />
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/settings" aria-label="Settings">
          <Settings className="w-4 h-4 text-zinc-500 hover:text-white transition-colors" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none rounded-full">
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarFallback className="text-xs font-medium bg-zinc-800 text-zinc-300">
                {initials(user?.name ?? user?.email)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">{user?.name ?? "Account"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
            >
              <LogOut className="w-4 h-4" />Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
