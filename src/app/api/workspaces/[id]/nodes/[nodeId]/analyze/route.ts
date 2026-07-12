import * as appStoreScraper from "@/lib/scrapers/appStore";
import { fetchWebContent, fetchPricingPage } from "@/lib/scrapers/jina";
import { searchReddit, getPostComments } from "@/lib/scrapers/reddit";
import { synthesizeReport } from "@/lib/claude";
import { analyzeNodeWithClaude } from "@/lib/claude";
import { gatherIOSData } from "@/lib/analysis/ios";
import { getAppEstimate } from "@/lib/estimation";
import { synthesizeWorkspace, buildAppSummaries } from "@/lib/analysis/workspaceSynthesis";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 120;

type SourceId = "appstore" | "reddit" | "web" | "website" | "ai";

function sse(ctrl: ReadableStreamDefaultController, data: object) {
  try { ctrl.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)); } catch { /* client disconnected — analysis continues */ }
}
function src(source: SourceId, status: "active" | "done" | "failed") {
  return { type: "source", source, status };
}
function histStr(pct: Record<string, number>) {
  return ["5","4","3","2","1"].map(s => `${s}★=${pct[s]??0}%`).join(" ");
}
function iosBlock(app: appStoreScraper.AppResult, hist?: appStoreScraper.RatingHistogram) {
  const l = [`[iOS] ${app.title} — ${app.developer}`,
    `Rating: ${app.rating.toFixed(1)}/5 · ${app.reviews.toLocaleString()} reviews · ${app.free?"Free":`$${app.price}`} · Genre: ${app.genre}`];
  if (hist) l.push(`Star distribution: ${histStr(hist.pct)}`);
  l.push(`URL: ${app.url}`, `Description: ${app.description}`);
  return l.join("\n");
}
function reviewBlock(reviews: appStoreScraper.ReviewResult[], label: string) {
  if (!reviews.length) return "";
  return `=== ${label} ===\n` + reviews.map(r => `[${r.rating}★] ${r.title ? r.title+": ":""}${r.text}`).join("\n");
}
function redditBlock(posts: Awaited<ReturnType<typeof searchReddit>>, comments: Map<string, string[]>) {
  return posts.map(p => {
    const lines = [`r/${p.subreddit} · ${p.score} pts\n"${p.title}"`];
    if (p.text) lines.push(p.text);
    const c = comments.get(p.permalink);
    if (c?.length) lines.push("Comments:\n" + c.map(s => `  • ${s}`).join("\n"));
    return lines.join("\n");
  }).join("\n\n");
}
function appNameFromUrl(url: string) {
  return url.match(/\/app\/([^/]+)\/id\d+/)?.[1].replace(/-/g," ") ?? "";
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; nodeId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { id: workspaceId, nodeId } = await params;

  const ws = await prisma.workspace.findFirst({ where: { id: workspaceId, userId: session.user.id } });
  if (!ws) return new Response("Not found", { status: 404 });

  const node = await prisma.node.findFirst({ where: { id: nodeId, workspaceId } });
  if (!node) return new Response("Not found", { status: 404 });

  const { category = "", audience = "", angle = "", focusArea = "" } = await req.json().catch(() => ({}));

  await prisma.node.update({ where: { id: nodeId }, data: { status: "analyzing" } });
  // Invalidate cached findings — data is changing, synthesis must regenerate
  await prisma.workspace.update({ where: { id: workspaceId }, data: { findings: null } });

  // ── iOS single-app deep analysis ──────────────────────────────────────────
  if (node.type === "ios" && node.urlApp) {
    const appUrl = node.urlApp;

    const stream = new ReadableStream({
      async start(ctrl) {
        try {
          sse(ctrl, src("appstore", "active"));
          const rawData = await gatherIOSData(appUrl, (step) => {
            if (step === "reddit") sse(ctrl, src("appstore", "done"));
          });

          sse(ctrl, src("appstore", "done"));
          sse(ctrl, src("reddit", rawData.reddit.length > 0 ? "done" : "failed"));
          sse(ctrl, src("website", rawData.appStorePageMarkdown.length > 100 ? "done" : "failed"));
          sse(ctrl, src("web", "done"));

          await prisma.node.update({
            where: { id: nodeId },
            data: {
              name: rawData.iTunes.name,
              iconUrl: rawData.iTunes.iconUrl,
              platformBadges: JSON.stringify(["iOS"]),
              rawData: JSON.stringify(rawData),
            },
          });

          sse(ctrl, src("ai", "active"));
          const report = await analyzeNodeWithClaude(rawData, nodeId);

          const appStoreId = String(rawData.iTunes.appId ?? "");
          const estimate = appStoreId ? await getAppEstimate(appStoreId) : null;

          await prisma.node.update({
            where: { id: nodeId },
            data: {
              status: "complete",
              analyzedAt: new Date(),
              report: JSON.stringify({ ...report, estimate }),
            },
          });

          const completedNodes = await prisma.node.findMany({
            where: { workspaceId, status: "complete" },
            select: { name: true, report: true },
          });
          const completedCount = completedNodes.length;

          // Regenerate workspace-level synthesis from all complete nodes
          let workspaceFindings: string | null = null;
          try {
            const summaries = buildAppSummaries(completedNodes);
            if (summaries.length >= 3) {
              const synthesis = await synthesizeWorkspace(summaries);
              workspaceFindings = JSON.stringify(synthesis);
            }
          } catch (e) {
            console.error("[workspace-synthesis]", e);
          }

          await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
              status: completedCount >= 1 ? "ready" : "building",
              opportunitySnippet: report.aiSynthesis?.implication?.slice(0, 120) ?? null,
              ...(workspaceFindings ? { findings: workspaceFindings } : {}),
            },
          });

          sse(ctrl, src("ai", "done"));
          sse(ctrl, { type: "complete", nodeId });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Analysis failed";
          console.error("[ios-analyze]", err);
          await prisma.node.update({ where: { id: nodeId }, data: { status: "failed", errorMessage: message } }).catch(() => {});
          sse(ctrl, { type: "error", message });
        } finally {
          ctrl.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  }

  // ── Website / App Store category search pipeline ──────────────────────────
  const urls: string[] = [];
  if (node.urlApp) urls.push(node.urlApp);
  if (node.urlSite) urls.push(node.urlSite);

  const stream = new ReadableStream({
    async start(ctrl) {
      const collected = { appStoreApps:"", appStoreReviews:"", redditPosts:"", websiteContent:"", pricingContent:"" };
      const resolvedNames: string[] = [];
      const devWebsites = new Map<string,string>();

      try {
        const iosUrls = urls.filter(u => u.includes("apps.apple.com"));
        const otherUrls = urls.filter(u => !u.includes("apps.apple.com"));

        sse(ctrl, src("appstore", "active"));
        const iosBlocks: string[] = []; const iosRevBlocks: string[] = [];

        if (category && node.type === "ios") {
          const results = await appStoreScraper.searchAppStore(category, 6);
          resolvedNames.push(...results.slice(0,3).map(a=>a.title));
          const deep = await Promise.all(results.slice(0,3).map(async app => {
            const [ratings,recent,helpful] = await Promise.all([
              appStoreScraper.getRatings(app.id),
              appStoreScraper.getReviews(app.id,1,"RECENT",20),
              appStoreScraper.getReviews(app.id,1,"HELPFUL",20),
            ]);
            return {app,ratings,recent,helpful};
          }));
          for (const d of deep) {
            iosBlocks.push(iosBlock(d.app, d.ratings??undefined));
            const b1=reviewBlock(d.recent,`${d.app.title} · Recent`);
            const b2=reviewBlock(d.helpful,`${d.app.title} · Helpful`);
            if(b1)iosRevBlocks.push(b1); if(b2)iosRevBlocks.push(b2);
            if(d.app.developerWebsite)devWebsites.set(d.app.title,d.app.developerWebsite);
          }
        }

        if (iosUrls.length) {
          const apps = (await Promise.all(iosUrls.map(u=>{const id=appStoreScraper.extractAppStoreId(u);return id?appStoreScraper.getAppById(id):null}))).filter(Boolean) as appStoreScraper.AppResult[];
          resolvedNames.push(...apps.map(a=>a.title));
          const deep = await Promise.all(apps.map(async app=>{
            const [ratings,recent,helpful]=await Promise.all([appStoreScraper.getRatings(app.id),appStoreScraper.getReviews(app.id,1,"RECENT",25),appStoreScraper.getReviews(app.id,1,"HELPFUL",25)]);
            return{app,ratings,recent,helpful};
          }));
          for(const d of deep){
            iosBlocks.push(iosBlock(d.app,d.ratings??undefined));
            const b1=reviewBlock(d.recent,`${d.app.title} · Recent`);
            const b2=reviewBlock(d.helpful,`${d.app.title} · Helpful`);
            if(b1)iosRevBlocks.push(b1); if(b2)iosRevBlocks.push(b2);
            if(d.app.developerWebsite)devWebsites.set(d.app.title,d.app.developerWebsite);
          }
          if(apps[0]) {
            await prisma.node.update({where:{id:nodeId},data:{
              name: apps[0].title,
              platformBadges: JSON.stringify(["iOS"]),
              iconUrl: apps[0].url,
            }});
          }
        }

        collected.appStoreApps = iosBlocks.join("\n\n---\n\n");
        collected.appStoreReviews = iosRevBlocks.join("\n\n");
        sse(ctrl, src("appstore", collected.appStoreApps?"done":"failed"));

        const pricingFetches = [...devWebsites.entries()].slice(0,5).map(
          ([name,site])=>fetchPricingPage(site,3000).then(c=>({name,content:c}))
        );

        sse(ctrl, src("reddit", "active"));
        const subject = category || resolvedNames[0] || (iosUrls[0]?appNameFromUrl(iosUrls[0]):"app");
        const [general,pain]=await Promise.all([searchReddit(`${subject} app review`,6),searchReddit(`${subject} complaints problems`,6)]);
        const seen=new Map<string,typeof general[0]>();
        for(const p of [...general,...pain]) if(!seen.has(p.permalink))seen.set(p.permalink,p);
        const posts=[...seen.values()].sort((a,b)=>b.score-a.score).slice(0,10);
        const topForComments=posts.filter(p=>p.numComments>2).slice(0,3);
        const cMap=new Map<string,string[]>();
        const cResults=await Promise.all(topForComments.map(p=>getPostComments(p.permalink,5)));
        topForComments.forEach((p,i)=>{if(cResults[i].length)cMap.set(p.permalink,cResults[i]);});
        collected.redditPosts=redditBlock(posts,cMap);
        sse(ctrl, src("reddit", collected.redditPosts?"done":"failed"));

        const pricingResults=await Promise.all(pricingFetches);
        collected.pricingContent=pricingResults.filter(r=>r.content.length>100).map(r=>`=== ${r.name} (pricing page) ===\n${r.content}`).join("\n\n");

        sse(ctrl, src("web","active")); sse(ctrl, src("web","done"));

        if(otherUrls.length){
          sse(ctrl,src("website","active"));
          const pages=await Promise.all(otherUrls.map(u=>fetchWebContent(u,3000)));
          collected.websiteContent=pages.filter(Boolean).join("\n\n---\n\n");
          sse(ctrl,src("website",collected.websiteContent?"done":"failed"));
          if(!resolvedNames.length) await prisma.node.update({where:{id:nodeId},data:{name:otherUrls[0].replace(/https?:\/\//,"").split("/")[0]}});
        }

        sse(ctrl, src("ai","active"));
        const synthCategory=category||resolvedNames.join(", ")||(iosUrls[0]?appNameFromUrl(iosUrls[0]):"")||"the provided app";
        const report=await synthesizeReport({
          mode:"app",category:synthCategory,audience,angle,focusArea,
          appStoreApps:collected.appStoreApps,
          appStoreReviews:collected.appStoreReviews,
          playStoreApps:"",
          playStoreReviews:"",
          redditPosts:collected.redditPosts,
          websiteContent:collected.websiteContent,
          pricingContent:collected.pricingContent,
        });

        const finalName=resolvedNames[0]??synthCategory;
        await prisma.node.update({
          where:{id:nodeId},
          data:{
            status:"complete",
            analyzedAt:new Date(),
            name:finalName,
            report:JSON.stringify(report),
            platformBadges:JSON.stringify(report.competitors?.[0]?.platforms??["Web"]),
          },
        });

        const completedCount=await prisma.node.count({where:{workspaceId,status:"complete"}});
        const snippets=report.gaps?.[0]?.evidence?.slice(0,120)??null;
        await prisma.workspace.update({
          where:{id:workspaceId},
          data:{
            status:completedCount>=1?"ready":"building",
            findings:JSON.stringify(report),
            opportunitySnippet:snippets,
          },
        });

        sse(ctrl, src("ai","done"));
        sse(ctrl, {type:"complete",nodeId,reportId:nodeId});
      } catch(err){
        const message=err instanceof Error?err.message:"Analysis failed";
        console.error("[node-analyze]",err);
        await prisma.node.update({where:{id:nodeId},data:{status:"failed",errorMessage:message}}).catch(()=>{});
        sse(ctrl,{type:"error",message});
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers:{"Content-Type":"text/event-stream","Cache-Control":"no-cache",Connection:"keep-alive"},
  });
}
