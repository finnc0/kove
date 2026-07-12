import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user.stripeCustomerId) return user.stripeCustomerId;

  // Race guard: create in Stripe then atomically store
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}
