import http from "http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = 3333;

function fmt(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function buildHtml() {
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

  const rows = users
    .map(
      (u) => `
      <tr>
        <td>${u.email}</td>
        <td>${u.name ?? "—"}</td>
        <td class="${u.subscriptionTier !== "explorer" ? "paid" : "free"}">${u.subscriptionTier}</td>
        <td>${u._count.workspaces}</td>
        <td>${fmt(u.createdAt)}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>One1 Admin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #09090b; color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; padding: 40px; }
    h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.3px; }
    .sub { color: #71717a; font-size: 13px; margin-top: 4px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 32px 0; }
    .card { background: #18181b; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 24px; }
    .card-label { font-size: 12px; color: #71717a; margin-bottom: 6px; }
    .card-value { font-size: 38px; font-weight: 600; font-variant-numeric: tabular-nums; }
    .table-wrap { background: #18181b; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; overflow: hidden; }
    .table-head { padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 1px solid rgba(255,255,255,0.06); }
    th { text-align: left; padding: 10px 24px; font-size: 11px; font-weight: 500; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 12px 24px; color: #a1a1aa; border-bottom: 1px solid rgba(255,255,255,0.04); }
    tbody tr:last-child td { border-bottom: none; }
    td:first-child { color: #e4e4e7; }
    .paid { color: #2dd4bf; font-weight: 500; }
    .free { color: #52525b; }
    .refresh { position: fixed; top: 20px; right: 40px; background: #27272a; border: 1px solid rgba(255,255,255,0.08); color: #a1a1aa; border-radius: 8px; padding: 6px 14px; font-size: 12px; cursor: pointer; text-decoration: none; }
    .refresh:hover { color: #fff; }
    .max { max-width: 900px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="max">
    <a class="refresh" href="/">↻ Refresh</a>
    <h1>Admin</h1>
    <p class="sub">One1 — internal dashboard</p>

    <div class="stats">
      <div class="card">
        <p class="card-label">Total users</p>
        <p class="card-value">${total}</p>
      </div>
      <div class="card">
        <p class="card-label">Paid users</p>
        <p class="card-value">${paid}</p>
      </div>
      <div class="card">
        <p class="card-label">Free users</p>
        <p class="card-value">${total - paid}</p>
      </div>
    </div>

    <div class="table-wrap">
      <div class="table-head">Users</div>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Plan</th>
            <th>Workspaces</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="5" style="text-align:center;padding:40px;color:#3f3f46">No users yet.</td></tr>'}</tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
}

const server = http.createServer(async (_req, res) => {
  try {
    const html = await buildHtml();
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } catch (err) {
    console.error(err);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Error querying database.");
  }
});

server.listen(PORT, () => {
  console.log(`Admin dashboard → http://localhost:${PORT}`);
});
