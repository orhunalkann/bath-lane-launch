"use client";

import { useMemo, useRef } from "react";
import {
  CalendarRange,
  ClipboardList,
  Columns3,
  DollarSign,
  LayoutList,
  RefreshCw,
  Search,
} from "lucide-react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { BacklogView } from "@/components/backlog-view";
import { BudgetView } from "@/components/budget-view";
import { CheckInsView } from "@/components/checkins-view";
import { CreateIssueDialog } from "@/components/create-issue-dialog";
import { IssueDetail } from "@/components/issue-detail";
import { KanbanBoard } from "@/components/kanban-board";
import { TimelineView } from "@/components/timeline-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useProjectStore } from "@/lib/client-store";
import { ASSIGNEES, EPICS, type EpicId, type ProjectData } from "@/lib/types";
import { cn } from "@/lib/utils";

const nav = [
  { id: "board" as const, label: "Board", icon: Columns3 },
  { id: "backlog" as const, label: "Backlog", icon: LayoutList },
  { id: "timeline" as const, label: "Timeline", icon: CalendarRange },
  { id: "budget" as const, label: "Budget", icon: DollarSign },
  { id: "checkins" as const, label: "Check-ins", icon: ClipboardList },
];

export function AppShell({ initialData }: { initialData: ProjectData }) {
  const hydrated = useRef(false);
  if (!hydrated.current) {
    // Prefer browser-local edits on Vercel (no durable server filesystem).
    useProjectStore.getState().hydrate(initialData);
    hydrated.current = true;
  }

  const data = useProjectStore((s) => s.data) ?? initialData;
  const error = useProjectStore((s) => s.error);
  const filters = useProjectStore((s) => s.filters);
  const activeView = useProjectStore((s) => s.activeView);
  const setFilters = useProjectStore((s) => s.setFilters);
  const setView = useProjectStore((s) => s.setView);
  const reset = useProjectStore((s) => s.reset);
  const updateMeta = useProjectStore((s) => s.updateMeta);

  const stats = useMemo(() => {
    if (!data) return null;
    const total = data.issues.length;
    const done = data.issues.filter((i) => i.status === "done").length;
    const inProgress = data.issues.filter(
      (i) => i.status === "in_progress" || i.status === "in_review",
    ).length;
    const critical = data.issues.filter((i) =>
      i.labels.includes("critical-path"),
    ).length;
    const spent = data.budget.reduce((s, b) => s + b.actual, 0);
    const days = differenceInCalendarDays(
      parseISO(data.meta.launchDate),
      new Date(),
    );
    return {
      total,
      done,
      inProgress,
      critical,
      spent,
      days,
      progress: total ? Math.round((done / total) * 100) : 0,
    };
  }, [data]);

  if (!data || !stats) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-sm text-destructive">{error ?? "Failed to load"}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <aside className="sticky top-0 flex h-screen w-[232px] shrink-0 flex-col bg-sidebar text-sidebar-foreground max-md:hidden">
          <div className="border-b border-sidebar-border px-4 py-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-primary">
              Project
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight">
              {data.meta.name}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/70">
              {data.meta.tagline}
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setView(item.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-primary"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className="space-y-3 border-t border-sidebar-border p-4 text-xs">
            <div>
              <div className="text-sidebar-foreground/60">Launch</div>
              <div className="mt-0.5 font-medium">
                {format(parseISO(data.meta.launchDate), "MMM d, yyyy")}
              </div>
              <div className="text-sidebar-primary">{stats.days} days out</div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sidebar-foreground/60">
                <span>Issues done</span>
                <span>
                  {stats.done}/{stats.total}
                </span>
              </div>
              <Progress value={stats.progress} className="h-1.5 bg-white/10" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={() => {
                if (
                  confirm(
                    "Reset board to the original 90-day plan? This clears check-ins and actual spend.",
                  )
                ) {
                  void reset();
                }
              }}
            >
              <RefreshCw className="size-3.5" />
              Reset seed plan
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    {data.meta.key}
                  </span>
                  <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                    {nav.find((n) => n.id === activeView)?.label}
                  </h1>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Social + Technical · under $5k · website first
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CreateIssueDialog />
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto md:hidden">
              {nav.map((item) => (
                <Button
                  key={item.id}
                  size="sm"
                  variant={activeView === item.id ? "default" : "outline"}
                  onClick={() => setView(item.id)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_160px_180px] sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filters.query}
                  onChange={(e) => setFilters({ query: e.target.value })}
                  placeholder="Search issues, labels, keys…"
                  className="pl-9"
                />
              </div>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={filters.assignee}
                onChange={(e) =>
                  setFilters({
                    assignee: e.target.value as typeof filters.assignee,
                  })
                }
              >
                <option value="all">All assignees</option>
                {ASSIGNEES.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={filters.epicId}
                onChange={(e) =>
                  setFilters({
                    epicId: e.target.value as EpicId | "all",
                  })
                }
              >
                <option value="all">All epics</option>
                {EPICS.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <MiniStat label="In flight" value={String(stats.inProgress)} />
              <MiniStat label="Critical path" value={String(stats.critical)} />
              <MiniStat
                label="Actual spend"
                value={`$${stats.spent.toLocaleString()}`}
              />
              <MiniStat label="Days to launch" value={String(stats.days)} />
            </div>
          </header>

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-5">
            {activeView === "board" ? (
              <>
                <PartnerStrip
                  social={data.meta.partners.social}
                  technical={data.meta.partners.technical}
                  positioning={data.meta.positioning}
                  onRename={(partners) => updateMeta({ partners })}
                />
                <KanbanBoard />
              </>
            ) : null}
            {activeView === "backlog" ? <BacklogView /> : null}
            {activeView === "timeline" ? <TimelineView /> : null}
            {activeView === "budget" ? <BudgetView /> : null}
            {activeView === "checkins" ? <CheckInsView /> : null}
          </main>
        </div>
        <IssueDetail />
      </div>
    </TooltipProvider>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card/80 px-3 py-2">
      <div className="text-[11px] font-medium text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function PartnerStrip({
  social,
  technical,
  positioning,
  onRename,
}: {
  social: string;
  technical: string;
  positioning: string;
  onRename: (partners: { social: string; technical: string }) => void;
}) {
  return (
    <div className="mb-4 grid gap-2 rounded-lg border border-border bg-card/70 p-3 text-sm shadow-sm sm:grid-cols-3">
      <label className="grid gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Social partner
        </span>
        <Input
          value={social}
          onChange={(e) =>
            onRename({ social: e.target.value, technical })
          }
        />
      </label>
      <label className="grid gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Technical partner
        </span>
        <Input
          value={technical}
          onChange={(e) => onRename({ social, technical: e.target.value })}
        />
      </label>
      <div className="grid gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Positioning (week 1)
        </span>
        <p className="rounded-md border border-dashed border-border bg-muted/30 px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
          {positioning}
        </p>
      </div>
    </div>
  );
}
