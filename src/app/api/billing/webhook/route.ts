import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Raw body required for Stripe signature verification
export const dynamic = "force-dynamic";

async function syncSubscription(sub: Stripe.Subscription) {
  const userId =
    (sub.metadata?.userId as string | undefined) ??
    (await prisma.user.findFirst({
      where: { stripeCustomerId: sub.customer as string },
      select: { id: true },
    }))?.id;

  if (!userId) return;

  const isActive = ["active", "trialing"].includes(sub.status);
  const isPastDue = sub.status === "past_due";
  const isCanceled = sub.status === "canceled";

  const periodEndTs = sub.items.data[0]?.current_period_end;
  const currentPeriodEnd = periodEndTs ? new Date(periodEndTs * 1000) : null;
  // Sync trial end from Stripe — this is the authoritative source
  const trialEndsAt = sub.trial_end ? new Date(sub.trial_end * 1000) : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: sub.id,
      subscriptionStatus: sub.status,
      subscriptionTier: isActive || isPastDue ? "pro" : "explorer",
      ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      cancelAtPeriodEnd: sub.cancel_at_period_end || sub.cancel_at != null,
      // Always write trialEndsAt when Stripe reports a trial end date
      ...(trialEndsAt ? { trialEndsAt } : {}),
      ...(isCanceled ? { stripeSubscriptionId: null } : {}),
    },
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  // Idempotency: skip already-processed events
  const already = await prisma.processedWebhookEvent.findUnique({ where: { id: event.id } });
  if (already) return NextResponse.json({ received: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        const userId = (session.metadata?.userId as string | undefined) ??
          (await prisma.user.findFirst({
            where: { stripeCustomerId: session.customer as string },
            select: { id: true },
          }))?.id;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: session.customer as string },
          });
        }

        await syncSubscription(sub);
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = (invoice.customer as string | Stripe.Customer | Stripe.DeletedCustomer | null) as string;
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: "past_due" },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as unknown as Record<string, unknown>).subscription as string | undefined;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        await syncSubscription(sub);
        break;
      }
    }

    await prisma.processedWebhookEvent.create({
      data: { id: event.id, type: event.type },
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
