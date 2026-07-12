import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/entitlements";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      stripeSubscriptionId: true,
    },
  });

  const now = new Date();

  // Defensive: expire cancelled-at-period-end subscriptions if webhook was late
  if (
    user.cancelAtPeriodEnd &&
    user.currentPeriodEnd &&
    now > user.currentPeriodEnd &&
    user.subscriptionStatus !== "canceled"
  ) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionTier: "explorer",
        subscriptionStatus: "canceled",
        stripeSubscriptionId: null,
        cancelAtPeriodEnd: false,
      },
    });
    user.subscriptionTier = "explorer";
    user.subscriptionStatus = "canceled";
    user.cancelAtPeriodEnd = false;
  }

  return NextResponse.json({
    tier: user.subscriptionTier,
    status: user.subscriptionStatus,
    isPro: isPro({ ...user, trialEndsAt: user.trialEndsAt }),
    trialEndsAt: user.trialEndsAt?.toISOString() ?? null,
    currentPeriodEnd: user.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: user.cancelAtPeriodEnd,
    hasUsedTrial: user.trialEndsAt !== null,
  });
}
