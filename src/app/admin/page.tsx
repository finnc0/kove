import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "carmichaelfw@g.cofc.edu";

function fmt(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AdminPage() {
  const session = await auth();
  if (session?.user?.email !== ADMIN_EMAIL) redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      createdAt: true,
      _count: { select: { workspaces: true } },
    },
  });

  const total = users.length;
  const paid = users.filter((u) => u.subscriptionTier !== "explorer").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="text-sm text-zinc-500 mt-1">Internal dashboard — One1</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl border border-white/[0.07] bg-zinc-900 p-6">
            <p className="text-xs text-zinc-500 mb-1">Total users</p>
            <p className="text-4xl font-semibold tabular-nums">{total}</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-zinc-900 p-6">
            <p className="text-xs text-zinc-500 mb-1">Paid users</p>
            <p className="text-4xl font-semibold tabular-nums">{paid}</p>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-zinc-900 p-6">
            <p className="text-xs text-zinc-500 mb-1">Free users</p>
            <p className="text-4xl font-semibold tabular-nums">{total - paid}</p>
          </div>
        </div>

        {/* Users table */}
        <div className="rounded-xl border border-white/[0.07] bg-zinc-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-medium">Users</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-500 text-xs">
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Plan</th>
                <th className="text-left px-6 py-3 font-medium">Workspaces</th>
                <th className="text-left px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={i < users.length - 1 ? "border-b border-white/[0.04]" : ""}
                >
                  <td className="px-6 py-3 text-zinc-200">{u.email}</td>
                  <td className="px-6 py-3 text-zinc-400">{u.name ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span className={
                      u.subscriptionTier === "explorer"
                        ? "text-zinc-500"
                        : "text-[#2dd4bf] font-medium"
                    }>
                      {u.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-zinc-400 tabular-nums">{u._count.workspaces}</td>
                  <td className="px-6 py-3 text-zinc-500">{fmt(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="px-6 py-10 text-center text-zinc-600 text-sm">No users yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
