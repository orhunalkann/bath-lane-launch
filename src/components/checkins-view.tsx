"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AssigneeAvatar } from "@/components/assignee-avatar";
import { useProjectStore } from "@/lib/client-store";
import type { Assignee } from "@/lib/types";

export function CheckInsView() {
  const data = useProjectStore((s) => s.data);
  const addCheckIn = useProjectStore((s) => s.addCheckIn);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    lastWeek: "",
    thisWeek: "",
    blockers: "",
    spend: "",
    author: "shared" as Assignee,
  });

  if (!data) return null;

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <form
        className="h-fit space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault();
          void addCheckIn(form);
          setForm((f) => ({
            ...f,
            lastWeek: "",
            thisWeek: "",
            blockers: "",
            spend: "",
          }));
        }}
      >
        <div>
          <h2 className="text-base font-semibold">Monday check-in</h2>
          <p className="text-sm text-muted-foreground">
            30 minutes: last week, this week, blockers, spend.
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="author">Logged by</Label>
          <select
            id="author"
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            value={form.author}
            onChange={(e) =>
              setForm({ ...form, author: e.target.value as Assignee })
            }
          >
            <option value="shared">Shared / both</option>
            <option value="social">Social</option>
            <option value="technical">Technical</option>
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="last">Last week</Label>
          <Textarea
            id="last"
            rows={3}
            value={form.lastWeek}
            onChange={(e) => setForm({ ...form, lastWeek: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="this">This week</Label>
          <Textarea
            id="this"
            rows={3}
            value={form.thisWeek}
            onChange={(e) => setForm({ ...form, thisWeek: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="blockers">Blockers</Label>
          <Textarea
            id="blockers"
            rows={2}
            value={form.blockers}
            onChange={(e) => setForm({ ...form, blockers: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="spend">Spend this week</Label>
          <Input
            id="spend"
            value={form.spend}
            onChange={(e) => setForm({ ...form, spend: e.target.value })}
            placeholder="$0 — samples, tools, etc."
          />
        </div>
        <Button type="submit" className="w-full">
          Save check-in
        </Button>
      </form>

      <div className="space-y-3">
        {data.checkIns.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
            No check-ins yet. Log your first Monday sync here.
          </div>
        ) : (
          data.checkIns.map((c) => (
            <article
              key={c.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <header className="mb-3 flex items-center justify-between gap-2">
                <div className="font-semibold">
                  {format(parseISO(c.date), "EEEE, MMM d, yyyy")}
                </div>
                <AssigneeAvatar assignee={c.author} showLabel />
              </header>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">
                    Last week
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap">{c.lastWeek}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">
                    This week
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap">{c.thisWeek}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">
                    Blockers
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap">
                    {c.blockers || "None"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">
                    Spend
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap">
                    {c.spend || "—"}
                  </dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
