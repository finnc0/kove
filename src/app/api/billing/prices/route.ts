import { stripe } from "@/lib/stripe";

export async function GET() {
  const monthlyId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const annualId  = process.env.STRIPE_PRICE_PRO_ANNUAL;

  if (!monthlyId || !annualId) {
    return Response.json({ error: "Prices not configured" }, { status: 500 });
  }

  const [monthly, annual] = await Promise.all([
    stripe.prices.retrieve(monthlyId),
    stripe.prices.retrieve(annualId),
  ]);

  function fmt(price: typeof monthly) {
    const cents = price.unit_amount ?? 0;
    return (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  }

  return Response.json({
    monthly: { id: monthlyId, amount: fmt(monthly), currency: monthly.currency },
    annual:  { id: annualId,  amount: fmt(annual),  currency: annual.currency  },
  });
}
