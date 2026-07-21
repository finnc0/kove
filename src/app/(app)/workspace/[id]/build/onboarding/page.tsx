import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BuildOnboarding } from "../_components/onboarding/BuildOnboarding";

type Params = Promise<{ id: string }>;

export default async function BuildOnboardingPage({ params }: { params: Params }) {
  const session = await auth();
  const { id: workspaceId } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session?.user?.id ?? "" },
    select: {
      id: true,
      name: true,
      findings: true,
      buildPlan: true,
    },
  });

  if (!workspace) redirect("/dashboard");

  // If onboarding already done, go to build home
  if (workspace.buildPlan?.onboardingComplete) {
    redirect(`/workspace/${workspaceId}/build`);
  }

  return (
    <BuildOnboarding
      workspaceId={workspaceId}
      workspaceName={workspace.name}
      initialPlan={workspace.buildPlan}
    />
  );
}
