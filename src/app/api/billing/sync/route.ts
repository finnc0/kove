import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Called from the success page with the Stripe checkout session_id.
// Syncs subscription status directly without relying on the webhook.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { sessionId } = await req.json();
  if (!sessionId) return Response.json({ error: "Missing sessionId" }, { status: 400 });

  const checkout = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (checkout.mode !== "subscription" || !checkout.subscription) {
    return Response.json({ error: "Not a subscription session" }, { status: 400 });
  }

  const sub = checkout.subscription as import("stripe").Stripe.Subscription;
  const isActive = ["active", "trialing"].includes(sub.status);
  const periodEndTs = sub.items.data[0]?.current_period_end;
  const currentPeriodEnd = periodEndTs ? new Date(periodEndTs * 1000) : null;
  const trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      stripeCustomerId: checkout.customer as string,
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      subscriptionTier: isActive ? "pro" : "explorer",
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      ...(trialEndsAt ? { trialEndsAt } : {}),
    },
  });

  return Response.json({ ok: true, isPro: isActive });
}
