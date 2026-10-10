"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { IssueCard } from "@/components/issue-card";
import { filterIssues, useProjectStore } from "@/lib/client-store";
import { STATUSES, type Issue, type Status } from "@/lib/types";
import { cn } from "@/lib/utils";

function Column({
  status,
  label,
  issues,
  onOpen,
}: {
  status: Status;
  label: string;
  issues: Issue[];
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[420px] w-[280px] shrink-0 flex-col rounded-lg bg-[#e8eeeb]/80 p-2",
        isOver && "drop-active bg-[#dcece7]",
      )}
    >
      <div className="mb-2 flex items-center justify-between px-1 py-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </h3>
        <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {issues.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {issues.map((issue, index) => (
          <div
            key={issue.id}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            <IssueCard issue={issue} onOpen={() => onOpen(issue.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const data = useProjectStore((s) => s.data);
  const filters = useProjectStore((s) => s.filters);
  const moveIssue = useProjectStore((s) => s.moveIssue);
  const selectIssue = useProjectStore((s) => s.selectIssue);
  const [active, setActive] = useState<Issue | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const filtered = useMemo(
    () => (data ? filterIssues(data.issues, filters) : []),
    [data, filters],
  );

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(
      STATUSES.map((s) => [s.id, [] as Issue[]]),
    ) as Record<Status, Issue[]>;
    for (const issue of filtered) {
      map[issue.status].push(issue);
    }
    for (const status of STATUSES) {
      map[status.id].sort((a, b) => {
        const order = { highest: 0, high: 1, medium: 2, low: 3, lowest: 4 };
        return order[a.priority] - order[b.priority];
      });
    }
    return map;
  }, [filtered]);

  function onDragStart(event: DragStartEvent) {
    const issue = data?.issues.find((i) => i.id === event.active.id) ?? null;
    setActive(issue);
  }

  async function onDragEnd(event: DragEndEvent) {
    setActive(null);
    const { active: dragActive, over } = event;
    if (!over) return;
    const issueId = String(dragActive.id);
    const overId = String(over.id);
    const statusIds = STATUSES.map((s) => s.id);
    let nextStatus: Status | null = null;
    if (statusIds.includes(overId as Status)) {
      nextStatus = overId as Status;
    } else {
      const overIssue = data?.issues.find((i) => i.id === overId);
      if (overIssue) nextStatus = overIssue.status;
    }
    if (!nextStatus) return;
    const current = data?.issues.find((i) => i.id === issueId);
    if (current && current.status !== nextStatus) {
      await moveIssue(issueId, nextStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <Column
            key={status.id}
            status={status.id}
            label={status.label}
            issues={byStatus[status.id]}
            onOpen={selectIssue}
          />
        ))}
      </div>
      <DragOverlay>
        {active ? (
          <div className="w-[280px] rotate-1">
            <IssueCard issue={active} onOpen={() => {}} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
