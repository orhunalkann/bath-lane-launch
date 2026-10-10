"use client";

import { format, parseISO } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TypeIcon } from "@/components/type-icon";
import { useProjectStore } from "@/lib/client-store";
import {
  ASSIGNEES,
  EPICS,
  STATUSES,
  type Assignee,
  type EpicId,
  type Priority,
  type Status,
} from "@/lib/types";

const priorities: Priority[] = ["highest", "high", "medium", "low", "lowest"];
const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

export function IssueDetail() {
  const data = useProjectStore((s) => s.data);
  const selectedIssueId = useProjectStore((s) => s.selectedIssueId);
  const selectIssue = useProjectStore((s) => s.selectIssue);
  const updateIssue = useProjectStore((s) => s.updateIssue);
  const deleteIssue = useProjectStore((s) => s.deleteIssue);

  const issue = data?.issues.find((i) => i.id === selectedIssueId) ?? null;
  const open = Boolean(issue);
  const epic = issue ? EPICS.find((e) => e.id === issue.epicId) : null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && selectIssue(null)}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {issue ? (
          <>
            <SheetHeader className="gap-1 border-b border-border pb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TypeIcon type={issue.type} />
                <span className="font-mono text-xs">{issue.key}</span>
                {epic ? (
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    style={{ backgroundColor: epic.color }}
                  >
                    {epic.name}
                  </span>
                ) : null}
              </div>
              <SheetTitle className="text-left text-xl leading-snug">
                <Input
                  value={issue.title}
                  onChange={(e) =>
                    updateIssue(issue.id, { title: e.target.value })
                  }
                  className="h-auto border-0 px-0 text-xl font-semibold shadow-none focus-visible:ring-0"
                />
              </SheetTitle>
              <SheetDescription className="text-left">
                Updated{" "}
                {format(parseISO(issue.updatedAt), "MMM d, yyyy · h:mm a")}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-5 grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className={selectClass}
                    value={issue.status}
                    onChange={(e) =>
                      updateIssue(issue.id, {
                        status: e.target.value as Status,
                      })
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className={selectClass}
                    value={issue.priority}
                    onChange={(e) =>
                      updateIssue(issue.id, {
                        priority: e.target.value as Priority,
                      })
                    }
                  >
                    {priorities.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="assignee">Assignee</Label>
                  <select
                    id="assignee"
                    className={selectClass}
                    value={issue.assignee}
                    onChange={(e) =>
                      updateIssue(issue.id, {
                        assignee: e.target.value as Assignee,
                      })
                    }
                  >
                    {ASSIGNEES.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="epic">Epic</Label>
                  <select
                    id="epic"
                    className={selectClass}
                    value={issue.epicId ?? "none"}
                    onChange={(e) =>
                      updateIssue(issue.id, {
                        epicId:
                          e.target.value === "none"
                            ? null
                            : (e.target.value as EpicId),
                      })
                    }
                  >
                    <option value="none">No epic</option>
                    {EPICS.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 grid gap-1.5">
                  <Label htmlFor="due">Due date</Label>
                  <Input
                    id="due"
                    type="date"
                    value={issue.dueDate ?? ""}
                    onChange={(e) =>
                      updateIssue(issue.id, {
                        dueDate: e.target.value || null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={issue.description}
                  onChange={(e) =>
                    updateIssue(issue.id, { description: e.target.value })
                  }
                  rows={5}
                  className="resize-none"
                />
              </div>

              {issue.checklist && issue.checklist.length > 0 ? (
                <div className="grid gap-2">
                  <Label>Checklist</Label>
                  <div className="rounded-md border border-border bg-muted/40 p-3">
                    {issue.checklist.map((item) => (
                      <label
                        key={item.id}
                        className="mb-2 flex cursor-pointer items-start gap-2 last:mb-0"
                      >
                        <Checkbox
                          checked={item.done}
                          onCheckedChange={(checked) =>
                            updateIssue(issue.id, {
                              checklist: issue.checklist!.map((c) =>
                                c.id === item.id
                                  ? { ...c, done: Boolean(checked) }
                                  : c,
                              ),
                            })
                          }
                          className="mt-0.5"
                        />
                        <span
                          className={
                            item.done
                              ? "text-sm text-muted-foreground line-through"
                              : "text-sm"
                          }
                        >
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : null}

              {issue.labels.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {issue.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded bg-secondary px-2 py-0.5 text-xs font-medium"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="flex justify-between border-t border-border pt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteIssue(issue.id)}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectIssue(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
