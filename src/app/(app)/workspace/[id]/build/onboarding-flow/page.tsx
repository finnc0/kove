import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingFlowDesigner } from "../_components/onboarding-flow/OnboardingFlowDesigner";

type Params = Promise<{ id: string }>;

export default async function OnboardingFlowPage({ params }: { params: Params }) {
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
          onboardingScreens: { orderBy: { order: "asc" } },
          tiers: { orderBy: { order: "asc" }, select: { id: true, name: true, order: true } },
        },
      },
    },
  });

  if (!workspace) redirect("/dashboard");
  if (!workspace.buildPlan?.onboardingComplete) {
    redirect(`/workspace/${workspaceId}/build/onboarding`);
  }

  const plan = workspace.buildPlan;

  return (
    <OnboardingFlowDesigner
      workspaceId={workspaceId}
      workspaceName={workspace.name}
      initialScreens={plan.onboardingScreens}
      tiers={plan.tiers}
    />
  );
}
