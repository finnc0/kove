import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, accounts: { select: { provider: true } } },
  });

  // Don't allow disconnect if Google is the only sign-in method (no password set)
  if (!user?.password) {
    return Response.json(
      { error: "Set a password before disconnecting Google." },
      { status: 400 },
    );
  }

  await prisma.account.deleteMany({
    where: { userId: session.user.id, provider: "google" },
  });

  return Response.json({ ok: true });
}
