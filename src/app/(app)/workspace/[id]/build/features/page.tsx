import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FeatureBoard } from "../_components/features/FeatureBoard";

type Params = Promise<{ id: string }>;

export default async function FeaturesPage({ params }: { params: Params }) {
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
        select: {
          id: true,
          name: true,
          idea: true,
          targetUser: true,
          onboardingComplete: true,
          features: { orderBy: [{ columnId: "asc" }, { priority: "asc" }] },
        },
      },
    },
  });

  if (!workspace) redirect("/dashboard");
  if (!workspace.buildPlan?.onboardingComplete) redirect(`/workspace/${workspaceId}/build/onboarding`);

  const completedCompetitorCount = workspace.nodes.filter((n) => n.status === "complete").length;

  return (
    <FeatureBoard
      workspaceId={workspaceId}
      workspaceName={workspace.name}
      plan={workspace.buildPlan}
      competitorCount={completedCompetitorCount}
    />
  );
}
