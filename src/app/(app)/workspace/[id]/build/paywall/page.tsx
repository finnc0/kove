import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaywallStructurer } from "../_components/paywall/PaywallStructurer";
import type { PSTier } from "../_components/paywall/types";

type Params = Promise<{ id: string }>;

export default async function PaywallPage({ params }: { params: Params }) {
  const session = await auth();
  const { id: workspaceId } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session?.user?.id ?? "" },
    select: {
      id: true,
      name: true,
      buildPlan: {
        select: {
          id: true,
          onboardingComplete: true,
          features: {
            orderBy: [{ category: "asc" }, { priority: "asc" }],
            select: { id: true, title: true, description: true, category: true, columnId: true },
          },
          tiers: {
            orderBy: { order: "asc" },
            include: { tierFeatures: { select: { featureId: true } } },
          },
        },
      },
    },
  });

  if (!workspace) redirect("/dashboard");
  if (!workspace.buildPlan?.onboardingComplete) {
    redirect(`/workspace/${workspaceId}/build/onboarding`);
  }

  const plan = workspace.buildPlan;

  const tiers: PSTier[] = plan.tiers.map((t) => ({
    id: t.id,
    name: t.name,
    order: t.order,
    prices: (t.prices as Record<string, string> | null) ?? null,
    notes: t.notes,
    featureIds: t.tierFeatures.map((tf) => tf.featureId),
  }));

  return (
    <PaywallStructurer
      workspaceId={workspaceId}
      workspaceName={workspace.name}
      initialTiers={tiers}
      features={plan.features}
    />
  );
}
