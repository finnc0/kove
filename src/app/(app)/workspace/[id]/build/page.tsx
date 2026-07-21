import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { WorkspaceSynthesis } from "@/lib/analysis/workspaceSynthesis";
import { BuildZoneHome } from "./_components/home/BuildZoneHome";

type Params = Promise<{ id: string }>;

export default async function BuildZonePage({ params }: { params: Params }) {
  const session = await auth();
  const { id: workspaceId } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session?.user?.id ?? "" },
    select: {
      id: true,
      name: true,
      findings: true,
      nodes: { select: { id: true, status: true } },
      buildPlan: {
        include: {
          features: { orderBy: { priority: "asc" } },
          paywallRules: true,
          tiers: { orderBy: { order: "asc" } },
          onboardingScreens: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!workspace) redirect("/dashboard");

  // Gate: onboarding must be complete
  if (!workspace.buildPlan?.onboardingComplete) {
    redirect(`/workspace/${workspaceId}/build/onboarding`);
  }

  const plan = workspace.buildPlan;

  // Parse workspace synthesis for the Research Bridge
  let synthesis: WorkspaceSynthesis | null = null;
  if (workspace.findings) {
    try {
      synthesis = JSON.parse(workspace.findings) as WorkspaceSynthesis;
    } catch {}
  }

  const gaps = synthesis?.featureGaps ?? [];
  const painPoints = synthesis?.painPoints ?? [];

  const completedCompetitorCount = workspace.nodes.filter(
    (n) => n.status === "complete",
  ).length;

  return (
    <BuildZoneHome
      workspaceId={workspaceId}
      workspaceName={workspace.name}
      competitorCount={completedCompetitorCount}
      plan={{
        id: plan.id,
        name: plan.name,
        idea: plan.idea,
        ideaSourceGap: plan.ideaSourceGap,
        targetUser: plan.targetUser,
        coreValue: plan.coreValue,
        monetization: plan.monetization,
        platform: plan.platform,
        designDirection: plan.designDirection,
        features: plan.features,
        paywallRules: plan.paywallRules,
        tiers: plan.tiers,
        onboardingScreens: plan.onboardingScreens,
      }}
      gaps={gaps}
      painPoints={painPoints}
    />
  );
}
