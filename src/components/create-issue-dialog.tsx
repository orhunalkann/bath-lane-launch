"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjectStore } from "@/lib/client-store";
import {
  ASSIGNEES,
  EPICS,
  type Assignee,
  type EpicId,
  type Priority,
} from "@/lib/types";

export function CreateIssueDialog() {
  const createIssue = useProjectStore((s) => s.createIssue);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<Assignee>("unassigned");
  const [priority, setPriority] = useState<Priority>("medium");
  const [epicId, setEpicId] = useState<EpicId | "none">("none");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createIssue({
      title: title.trim(),
      description,
      assignee,
      priority,
      epicId: epicId === "none" ? null : epicId,
      status: "todo",
    });
    setTitle("");
    setDescription("");
    setAssignee("unassigned");
    setPriority("medium");
    setEpicId("none");
    setOpen(false);
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        Create
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Create issue</DialogTitle>
            </DialogHeader>
            <div className="mt-4 grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Summary</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to get done?"
                  required
                  autoFocus
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="assignee">Assignee</Label>
                  <select
                    id="assignee"
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value as Assignee)}
                  >
                    {ASSIGNEES.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                  >
                    {(
                      ["highest", "high", "medium", "low", "lowest"] as const
                    ).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="epic">Epic</Label>
                <select
                  id="epic"
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={epicId}
                  onChange={(e) =>
                    setEpicId(e.target.value as EpicId | "none")
                  }
                >
                  <option value="none">No epic</option>
                  {EPICS.map((epic) => (
                    <option key={epic.id} value={epic.id}>
                      {epic.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create issue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
