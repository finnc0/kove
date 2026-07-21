import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
      buildPlan: {
        include: {
          features: { orderBy: { priority: "asc" } },
          paywallRules: true,
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

  // Placeholder — full home built in Phase 4
  return (
    <div
      className="min-h-screen bg-zinc-950"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.025) 1.5px, transparent 1.5px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600">Build Zone</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">{plan.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">{plan.idea}</p>
        <p className="mt-4 text-xs text-zinc-600">Full home screen coming in Phase 4.</p>
      </div>
    </div>
  );
}
