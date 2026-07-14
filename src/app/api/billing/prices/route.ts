import { stripe } from "@/lib/stripe";

export async function GET() {
  const monthlyId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  const annualId  = process.env.STRIPE_PRICE_PRO_ANNUAL;

  if (!monthlyId || !annualId) {
    console.error("[billing/prices] Missing price env vars:", { monthlyId: !!monthlyId, annualId: !!annualId });
    return Response.json({ error: "Prices not configured" }, { status: 500 });
  }

  function fmt(cents: number | null) {
    const n = cents ?? 0;
    return (n / 100).toFixed(n % 100 === 0 ? 0 : 2);
  }

  // Fetch individually so one failure doesn't block the other
  const [monthlyResult, annualResult] = await Promise.allSettled([
    stripe.prices.retrieve(monthlyId),
    stripe.prices.retrieve(annualId),
  ]);

  if (monthlyResult.status === "rejected") {
    console.error("[billing/prices] Failed to retrieve monthly price:", monthlyId, monthlyResult.reason);
  }
  if (annualResult.status === "rejected") {
    console.error("[billing/prices] Failed to retrieve annual price:", annualId, annualResult.reason);
  }

  if (monthlyResult.status === "rejected" && annualResult.status === "rejected") {
    return Response.json({ error: "Could not retrieve prices from Stripe" }, { status: 500 });
  }

  const monthly = monthlyResult.status === "fulfilled" ? monthlyResult.value : null;
  const annual  = annualResult.status  === "fulfilled" ? annualResult.value  : null;

  return Response.json({
    monthly: monthly
      ? { id: monthlyId, amount: fmt(monthly.unit_amount), currency: monthly.currency }
      : null,
    annual: annual
      ? { id: annualId, amount: fmt(annual.unit_amount), currency: annual.currency }
      : null,
  });
}
