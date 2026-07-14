import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";

// Temporary diagnostic endpoint — remove after debugging Stripe price IDs.
// Protected: only accessible when signed in.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const monthlyId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const annualId  = process.env.STRIPE_PRICE_PRO_ANNUAL;
  const hasKey    = !!process.env.STRIPE_SECRET_KEY;
  const keyMode   = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live") ? "live" : "test";

  async function testPrice(id: string | undefined) {
    if (!id) return { configured: false };
    try {
      const p = await stripe.prices.retrieve(id);
      return {
        configured: true,
        id: id.slice(0, 12) + "...",
        ok: true,
        active: p.active,
        unit_amount: p.unit_amount,
        currency: p.currency,
        recurring: p.recurring?.interval ?? null,
      };
    } catch (e: unknown) {
      return {
        configured: true,
        id: id.slice(0, 12) + "...",
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  const [monthly, annual] = await Promise.all([
    testPrice(monthlyId),
    testPrice(annualId),
  ]);

  return Response.json({ hasKey, keyMode, monthly, annual });
}
