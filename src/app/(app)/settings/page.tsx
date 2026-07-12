import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AccountSection } from "./_components/AccountSection";
import { PasswordSection } from "./_components/PasswordSection";
import { ConnectedSection } from "./_components/ConnectedSection";
import { DangerSection } from "./_components/DangerSection";
import { BillingSection } from "./_components/BillingSection";

export const metadata: Metadata = { title: "Settings — Kove" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      password: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) redirect("/sign-in");

  const googleConnected = user.accounts.some((a) => a.provider === "google");

  return (
    <div>
      <div className="h-11 border-b border-white/[0.06] bg-zinc-950 flex items-center px-6 shrink-0">
        <span className="text-sm text-zinc-500">Settings</span>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage your account</p>
        </div>

        <div className="space-y-4">
          <BillingSection />
          <AccountSection initialName={user.name ?? ""} initialEmail={user.email ?? ""} />
          {user.password && <PasswordSection />}
          <ConnectedSection googleConnected={googleConnected} />
          <DangerSection />
        </div>
      </div>
    </div>
  );
}