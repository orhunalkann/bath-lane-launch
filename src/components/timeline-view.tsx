"use client";

import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { AssigneeAvatar } from "@/components/assignee-avatar";
import { filterIssues, useProjectStore } from "@/lib/client-store";
import { EPICS } from "@/lib/types";
import { cn } from "@/lib/utils";

const milestones = [
  { date: "2026-10-17", label: "Week 1 decisions locked" },
  { date: "2026-11-13", label: "Production order (critical)" },
  { date: "2026-11-16", label: "Waitlist page live" },
  { date: "2027-01-19", label: "Launch day" },
  { date: "2027-02-06", label: "Chinese New Year risk" },
];

export function TimelineView() {
  const data = useProjectStore((s) => s.data);
  const filters = useProjectStore((s) => s.filters);
  const selectIssue = useProjectStore((s) => s.selectIssue);

  if (!data) return null;

  const today = new Date();
  const launch = parseISO(data.meta.launchDate);
  const daysToLaunch = differenceInCalendarDays(launch, today);

  const issues = filterIssues(data.issues, filters)
    .filter((i) => i.dueDate)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));

  const byWeek = new Map<number, typeof issues>();
  for (const issue of issues) {
    const week = issue.week ?? 0;
    if (!byWeek.has(week)) byWeek.set(week, []);
    byWeek.get(week)!.push(issue);
  }

  const weeks = [...byWeek.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Countdown
            </div>
            <div className="mt-1 text-3xl font-semibold tracking-tight">
              {daysToLaunch > 0 ? `${daysToLaunch} days` : "Launch window"}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Target launch {format(launch, "MMMM d, yyyy")} · Shopify-first
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {milestones.map((m) => (
              <div
                key={m.date}
                className="rounded-md border border-border bg-muted/40 px-3 py-2"
              >
                <div className="text-[11px] font-medium text-primary">
                  {format(parseISO(m.date), "MMM d")}
                </div>
                <div className="text-xs text-foreground">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {weeks.map(([week, weekIssues]) => (
          <div
            key={week}
            className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          >
            <div className="border-b border-border bg-muted/40 px-4 py-2 text-sm font-semibold">
              {week === 0 ? "Unscheduled / post-launch" : `Week ${week}`}
            </div>
            <div className="divide-y divide-border">
              {weekIssues.map((issue) => {
                const epic = EPICS.find((e) => e.id === issue.epicId);
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => selectIssue(issue.id)}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent/50"
                  >
                    <div className="w-16 shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">
                      {issue.dueDate
                        ? format(parseISO(issue.dueDate), "MMM d")
                        : "—"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {issue.key}
                        </span>
                        {epic ? (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            style={{ backgroundColor: epic.color }}
                          >
                            {epic.name}
                          </span>
                        ) : null}
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium capitalize",
                            issue.status === "done"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {issue.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="mt-0.5 text-sm font-medium">
                        {issue.title}
                      </div>
                    </div>
                    <AssigneeAvatar assignee={issue.assignee} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
