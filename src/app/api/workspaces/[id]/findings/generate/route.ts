import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildAppSummaries,
  synthesizeWorkspaceStreaming,
  type WorkspaceSynthesis,
} from "@/lib/analysis/workspaceSynthesis";

export const runtime = "nodejs";
export const maxDuration = 120;

function sse(ctrl: ReadableStreamDefaultController, data: object) {
  try {
    ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
  } catch { /* client disconnected */ }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const userId = session.user!.id as string;
  const body = await req.json().catch(() => ({}));
  const force = body?.force === true;

  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        // Step 1 — load workspace and check cache
        sse(ctrl, { type: "step", step: 0, pct: 5 });
        const ws = await prisma.workspace.findFirst({
          where: { id, userId },
        });
        if (!ws) {
          sse(ctrl, { type: "error", message: "Workspace not found" });
          return;
        }

        // Step 2 — load complete nodes
        sse(ctrl, { type: "step", step: 1, pct: 10 });
        const nodes = await prisma.node.findMany({
          where: { workspaceId: id, status: "complete", report: { not: null } },
          select: { id: true, name: true, report: true },
        });

        if (nodes.length === 0) {
          sse(ctrl, { type: "error", message: "No analyzed apps found" });
          return;
        }

        // Check if cached synthesis is still valid (skipped when force=true)
        if (!force && ws.findings) {
          try {
            const stored = JSON.parse(ws.findings) as WorkspaceSynthesis;
            if (stored.nicheOverview && stored.appCount === nodes.length) {
              sse(ctrl, { type: "complete", synthesis: stored });
              return;
            }
          } catch { /* stale/corrupt — regenerate */ }
        }

        // Step 3 — parse reports
        sse(ctrl, { type: "step", step: 2, pct: 13 });
        const summaries = buildAppSummaries(nodes);
        if (summaries.length === 0) {
          sse(ctrl, { type: "error", message: "Could not parse app reports" });
          return;
        }

        // Step 4 — stream synthesis from Claude (pct 15 → 90)
        sse(ctrl, { type: "step", step: 3, pct: 15 });
        const synthesis = await synthesizeWorkspaceStreaming(summaries, (pct) => {
          sse(ctrl, { type: "progress", pct });
        });

        // Step 5 — save to DB
        sse(ctrl, { type: "step", step: 4, pct: 92 });
        await prisma.workspace.update({
          where: { id },
          data: { findings: JSON.stringify(synthesis) },
        });

        sse(ctrl, { type: "complete", synthesis });
      } catch (e) {
        const message = e instanceof Error ? e.message : "Synthesis failed";
        console.error("[findings-generate]", e);
        sse(ctrl, { type: "error", message });
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
