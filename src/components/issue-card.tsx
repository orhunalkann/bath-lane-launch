"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO, isPast, isToday } from "date-fns";
import { Calendar } from "lucide-react";
import { AssigneeAvatar } from "@/components/assignee-avatar";
import { PriorityIcon } from "@/components/priority-icon";
import { TypeIcon } from "@/components/type-icon";
import { EPICS, type Issue } from "@/lib/types";
import { cn } from "@/lib/utils";

export function IssueCard({
  issue,
  onOpen,
  dragging = false,
}: {
  issue: Issue;
  onOpen: () => void;
  dragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: issue.id, data: { issue } });

  const epic = EPICS.find((e) => e.id === issue.epicId);
  const due =
    issue.dueDate != null
      ? (() => {
          const d = parseISO(issue.dueDate);
          const overdue = isPast(d) && !isToday(d) && issue.status !== "done";
          return { label: format(d, "MMM d"), overdue };
        })()
      : null;

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "animate-card-in w-full rounded-md border border-border bg-card p-3 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md",
        (isDragging || dragging) && "opacity-40 shadow-lg ring-2 ring-primary/30",
      )}
      onClick={onOpen}
      {...listeners}
      {...attributes}
    >
      {epic ? (
        <div className="mb-2 flex items-center gap-1.5">
          <span
            className="size-2 rounded-sm"
            style={{ backgroundColor: epic.color }}
          />
          <span className="truncate text-[11px] font-medium text-muted-foreground">
            {epic.name}
          </span>
        </div>
      ) : null}
      <div className="mb-2 flex items-start gap-2">
        <TypeIcon type={issue.type} className="mt-0.5 shrink-0" />
        <p className="text-sm font-medium leading-snug text-foreground">
          {issue.title}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PriorityIcon priority={issue.priority} />
          <span className="font-mono text-[11px] text-muted-foreground">
            {issue.key}
          </span>
          {due ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[11px]",
                due.overdue ? "font-semibold text-destructive" : "text-muted-foreground",
              )}
            >
              <Calendar className="size-3" />
              {due.label}
            </span>
          ) : null}
        </div>
        <AssigneeAvatar assignee={issue.assignee} />
      </div>
      {issue.labels.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {issue.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}
