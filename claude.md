# One1 — Platform Definition

## Overview

**App Name:** One1
**Type:** SaaS web application
**Stack:** Next.js (App Router), shadcn/ui, Tailwind CSS, Geist Sans
**Stage:** MVP

### Primary Objective

Give startup founders a fast, AI-powered research workspace to understand any app market — who's competing, what users hate, and where the real product opportunities are — so they can make sharper positioning and build decisions before writing a single line of code.

---

## Target Audience

Startup founders researching a market before building. Solo or early-stage teams who need structured competitive intelligence without hiring a research firm or spending weeks manually reading reviews.

---

## MVP Feature List

### 1. Research Modes

- **Market Research** — input a market category/keyword and get a live AI-generated landscape report
- **App Analysis** — paste any App Store, Play Store, or product website URL and get a full breakdown
- **Full Sweep** — combined mode: market research + deep per-app analysis in one report

### 2. Data Sources

- App Store metadata + reviews via `app-store-scraper` (npm)
- Google Play metadata + reviews via `google-play-scraper` (npm)
- Website content via Jina AI URL reader (`r.jina.ai/[url]`)
- Reddit threads via Reddit API (free tier)
- Live web search via Claude web search tool (news, forums, comparisons)

### 3. Report Sections (every analysis)

- **Market Snapshot** — category, size signals, growth direction, 3–4 stat cards + summary paragraph
- **Competitor Map** — top 5–8 players, positioning, pricing, rating, strengths/weaknesses
- **Pain Points** — top 10 ranked user frustrations with source attribution and severity badges
- **Gap Analysis** — unaddressed needs mapped to specific opportunities with evidence
- **Opportunity Scores** — each gap rated: market size (1–5), build effort (1–5), competitive moat (1–5)
- **Positioning Recommendations** — tailored wedge, ICP, and differentiation strategy for a new entrant

### 4. Workspace & Organization

- Named projects — group related analyses together
- Save & revisit reports — every analysis is persisted and revisitable
- Report history — list of past analyses per project
- Basic notes — freeform annotations on any saved report

### 5. URL / App Input

- Auto-detect input type (App Store link / Play Store link / website URL / keyword)
- Add multiple URLs in a single analysis run
- Chips UI for managing added URLs before running

### 6. Export

- Export report as Markdown
- Export report as PDF
- Copy to clipboard

### 7. Auth & Accounts

- Sign up / sign in — email + password
- Google OAuth
- Personal workspace — all projects and reports tied to account

---

## Out of Scope for MVP

- Team collaboration or shared workspaces
- Trend signals / search volume data
- User persona generator
- Slack / Notion integrations
- Custom report templates
- API access for developers
- Mobile app

---

## MVP User Flow

```
Sign up → Create project → Choose mode →
Enter market or paste URL(s) →
App pulls data from sources →
Claude synthesizes into report →
Review report → Annotate → Export
```

---

## Technical Data Layer

| Source | Tool | Cost |
|---|---|---|
| App Store | `app-store-scraper` (npm) | Free |
| Play Store | `google-play-scraper` (npm) | Free |
| Websites | Jina AI (`r.jina.ai`) | Free tier |
| G2 / Trustpilot | Apify actors | Pay per use |
| Reddit | Reddit API | Free (rate limited) |
| Product Hunt | Official GraphQL API | Free |
| Web search | Claude web search tool | Included in API |

---

## UI Design System

### Design Principles

- Clean, data-dense but not overwhelming — this is a tool, not a marketing site
- Sidebar-based navigation with a persistent workspace feel (Linear / Notion / Perplexity)
- Reports feel like documents — readable, structured, easy to scan
- Neutral base with one strong accent color for actions
- shadcn defaults as the component foundation — no heavy custom styling at MVP

### Typography

- **Font:** Geist Sans (Next.js default)
- **Weights:** 400 regular, 500 medium, 600 semibold only
- **Scale:** text-xs (12px) / text-sm (14px) / text-base (16px) / text-xl (20px) / text-2xl (24px) / text-3xl (30px) / text-5xl (48px)

### Color System

- **Background:** white (`bg-white`) and off-white (`bg-zinc-50`)
- **Borders:** `border-zinc-200` default, `border-zinc-400` on hover/active
- **Text primary:** `text-zinc-900`
- **Text secondary:** `text-zinc-500`
- **Text muted:** `text-zinc-400`
- **Primary action:** `bg-zinc-900 text-white`
- **Sidebar background:** white with `border-r border-zinc-200`

### Semantic Badge Colors

| Context | Background | Text | Border |
|---|---|---|---|
| Market mode | `bg-blue-50` | `text-blue-700` | `border-blue-200` |
| App mode | `bg-violet-50` | `text-violet-700` | `border-violet-200` |
| Full Sweep mode | `bg-teal-50` | `text-teal-700` | `border-teal-200` |
| Pain point: High | `bg-red-50` | `text-red-700` | `border-red-200` |
| Pain point: Medium | `bg-amber-50` | `text-amber-700` | `border-amber-200` |
| Pain point: Low | `bg-green-50` | `text-green-700` | `border-green-200` |

### Layout

- **Overall:** two-column — fixed left sidebar (240px) + scrollable main content area
- **Max content width:** 1100px (landing), `max-w-5xl` (app pages)
- **Sidebar:** fixed, full height, white, `border-r border-zinc-200`
- **Mobile:** sidebar collapses to top nav, opens as shadcn `Sheet` from left

### Animations

- No heavy animations at MVP
- Subtle `animate-fade-in` on hero headline (landing page only)
- Hover transitions on cards and buttons: `transition-colors`

---

## shadcn Component Inventory

| Component | Used For |
|---|---|
| `Button` | Primary, secondary, ghost, destructive actions |
| `Input` | All text inputs |
| `Textarea` | Notes panel, focus fields |
| `Card` | Competitor cards, mode tiles, dashboard tiles, feature cards |
| `Badge` | Mode type, severity, platform, source labels |
| `Separator` | Section dividers in reports |
| `Sheet` | Notes panel (slides from right), mobile sidebar |
| `Dialog` | Rename / delete confirmation prompts |
| `DropdownMenu` | Export options, quick action menus |
| `Tooltip` | Opportunity score explanations |
| `ScrollArea` | Sidebar project list, report section nav |
| `Skeleton` | Loading states during analysis |
| `Progress` | Analysis progress indicator |
| `Avatar` | User avatar in sidebar bottom |
| `Collapsible` | Sidebar project list expand/collapse |
| `Alert` | Auth error messages |

---

## Pages & Screens

### 1. Landing Page (`/`)

Sections in order:
1. **Navbar** — fixed, One1 wordmark left, Sign in + Get started right
2. **Hero** — headline, subheading, two CTAs, social proof line, product screenshot placeholder
3. **How It Works** — three-step column grid (Search → Pull → Report)
4. **Features** — six-card grid of core capabilities
5. **CTA Banner** — dark zinc-900 bg, final signup push
6. **Footer** — wordmark, tagline, links, copyright

### 2. Auth Pages

- `/sign-up` — full name, email, password, Google OAuth, terms
- `/sign-in` — email, password, Google OAuth, forgot password link
- `/forgot-password` — email input, send reset link (UI stub only)
- Shared: centered card layout on `bg-zinc-50`, One1 logo above card linking back to `/`

### 3. App Shell (authenticated)

Persistent across all authenticated pages:
- **Left Sidebar** — logo, New Analysis button, projects list (collapsible), user avatar + settings at bottom
- **Top Bar** — breadcrumb left, contextual actions right
- **Main Content Area** — `bg-zinc-50`, scrollable, `max-w-5xl mx-auto px-8 py-10`

### 4. Dashboard (`/dashboard`)

- Time-aware greeting
- New analysis tiles (3 modes)
- Recent reports list (up to 5)
- Quick stats row (total analyses, markets, apps, pain points)
- Empty state for new users

### 5. New Analysis Flow (`/new-analysis`)

Three steps in sequence within the main content area:
1. **Choose Mode** — three selectable tiles
2. **Input** — fields change based on mode (keyword / URL chips / both)
3. **Run** — progress indicator showing data sources being queried, transitions into report on completion

### 6. Report View (`/report/[id]`)

- Top bar: report title (editable), mode badge, date, export dropdown, re-run button
- Sticky section nav inside main area (scrollspy)
- Report body sections: Market Snapshot → Competitor Map → Pain Points → Gap Analysis → Opportunity Scores → Positioning
- Collapsible notes panel (slides in from right via shadcn `Sheet`)

### 7. Project View (`/projects/[id]`)

- Project name heading (editable inline)
- New Analysis button
- List of all reports in project with mode badge, date, quick actions

### 8. Settings (`/settings`)

- Account: name, email, change password
- Connected accounts: Google OAuth status
- Danger zone: delete account

---

## File Structure

```
app/
  page.tsx                        ← Landing page
  layout.tsx                      ← Root layout
  (auth)/
    layout.tsx                    ← Auth shell (centered card)
    sign-in/page.tsx
    sign-up/page.tsx
    forgot-password/page.tsx
  (app)/
    layout.tsx                    ← App shell (sidebar + main)
    dashboard/page.tsx
    new-analysis/page.tsx
    report/[id]/page.tsx
    projects/[id]/page.tsx
    settings/page.tsx

components/
  landing/
    Navbar.tsx
    Hero.tsx
    HowItWorks.tsx
    Features.tsx
    CTABanner.tsx
    Footer.tsx
  auth/
    AuthCard.tsx
    OAuthButton.tsx
    FieldError.tsx
    Divider.tsx
  app/
    Sidebar.tsx
    TopBar.tsx
    NewAnalysisCard.tsx
    RecentReports.tsx
    EmptyState.tsx
    report/
      SectionNav.tsx
      MarketSnapshot.tsx
      CompetitorMap.tsx
      PainPoints.tsx
      GapAnalysis.tsx
      OpportunityScores.tsx
      Positioning.tsx
      NotesPanel.tsx
```

---

## General Technical Rules (all pages)

- Next.js App Router (`app/` directory) throughout
- Server components by default — use `"use client"` only where state or interactivity is needed
- `react-hook-form` + `zod` for all form validation
- shadcn `cn()` utility for conditional classnames
- `lucide-react` for all icons — no custom SVG icon sets
- Tailwind only for styling — no custom CSS files
- No `framer-motion` at MVP
- All navigation uses Next.js `<Link>`
- Mock/stubbed data at MVP — real API integration wired separately
- Page titles follow pattern: "Page Name — One1"