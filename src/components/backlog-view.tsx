"use client";

import { format, parseISO } from "date-fns";
import { AssigneeAvatar } from "@/components/assignee-avatar";
import { PriorityIcon } from "@/components/priority-icon";
import { TypeIcon } from "@/components/type-icon";
import { filterIssues, useProjectStore } from "@/lib/client-store";
import { EPICS, STATUSES } from "@/lib/types";
import { cn } from "@/lib/utils";

export function BacklogView() {
  const data = useProjectStore((s) => s.data);
  const filters = useProjectStore((s) => s.filters);
  const selectIssue = useProjectStore((s) => s.selectIssue);
  const moveIssue = useProjectStore((s) => s.moveIssue);

  if (!data) return null;
  const issues = filterIssues(data.issues, filters).sort((a, b) => {
    const da = a.dueDate ?? "9999";
    const db = b.dueDate ?? "9999";
    return da.localeCompare(db);
  });

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="grid grid-cols-[100px_1fr_110px_100px_100px_90px] gap-2 border-b border-border bg-muted/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground max-md:grid-cols-[80px_1fr_90px]">
        <span>Key</span>
        <span>Summary</span>
        <span className="max-md:hidden">Status</span>
        <span className="max-md:hidden">Assignee</span>
        <span>Due</span>
        <span className="max-md:hidden">Priority</span>
      </div>
      <div className="divide-y divide-border">
        {issues.map((issue) => {
          const epic = EPICS.find((e) => e.id === issue.epicId);
          const status = STATUSES.find((s) => s.id === issue.status);
          return (
            <button
              key={issue.id}
              type="button"
              onClick={() => selectIssue(issue.id)}
              className="grid w-full grid-cols-[100px_1fr_110px_100px_100px_90px] items-center gap-2 px-3 py-2.5 text-left transition hover:bg-accent/60 max-md:grid-cols-[80px_1fr_90px]"
            >
              <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <TypeIcon type={issue.type} />
                {issue.key}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {issue.title}
                </span>
                {epic ? (
                  <span
                    className="mt-0.5 inline-block truncate text-[11px]"
                    style={{ color: epic.color }}
                  >
                    {epic.name}
                  </span>
                ) : null}
              </span>
              <span className="max-md:hidden">
                <select
                  className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs"
                  value={issue.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    void moveIssue(
                      issue.id,
                      e.target.value as typeof issue.status,
                    );
                  }}
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </span>
              <span className="max-md:hidden">
                <AssigneeAvatar assignee={issue.assignee} showLabel />
              </span>
              <span
                className={cn(
                  "text-xs",
                  issue.dueDate ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {issue.dueDate
                  ? format(parseISO(issue.dueDate), "MMM d")
                  : "—"}
              </span>
              <span className="flex items-center gap-1 max-md:hidden">
                <PriorityIcon priority={issue.priority} />
                <span className="text-xs capitalize text-muted-foreground">
                  {issue.priority}
                </span>
                <span className="sr-only">{status?.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
