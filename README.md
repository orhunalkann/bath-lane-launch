# Bath Lane — Launch Board

A Jira-style project tracker for a two-person, white-label dog shampoo brand launching on Shopify in ~90 days (target: **January 19, 2027**), under a **$5k** all-in budget.

Seeded from the *Dog Shampoo Brand — 90-Day Launch Plan*: Social owns customer-facing work; Technical owns product, legal, and ops. Joint calls on positioning, name, supplier, prices, and spend over $200.

## What's inside

- **Board** — drag-and-drop Kanban (Backlog → To Do → In Progress → In Review → Done)
- **Backlog** — sortable issue list with inline status changes
- **Timeline** — week-by-week plan + critical milestones (production order Nov 13, waitlist Nov 16, launch Jan 19)
- **Budget** — $4,940 planned line items with actual spend tracking against the $5k cap
- **Check-ins** — Monday sync notes (last week / this week / blockers / spend)
- Shared JSON store via `/api/project` so both partners see the same board when using the same server

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Production:

```bash
npm run build
npm start
```

## Deploy (Vercel)

Import this GitHub repo in [Vercel](https://vercel.com/new). Framework preset: Next.js. No env vars required.

On Vercel, board edits persist in the browser (`localStorage`) so both partners should use the same shared browser profile, or treat it as a personal working copy. Local `npm run dev` still saves to `data/project.json` on the server.

## Roles (from the plan)

| Area | Social | Technical |
|------|--------|-----------|
| Brand | Name, logo, voice, labels, AI images | Trademark/domain checks, dielines, claim approval |
| Product | Sample feedback, dog-test videos | Suppliers, quotes, QC, import |
| Website | Copy & imagery | Shopify, payments, shipping, pixels |
| Growth | IG/TikTok, creators, waitlist | Ads accounts, codes, reporting |
| Ops | Customer messages & reviews | Inventory, packing, bookkeeping |

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, dnd-kit.
