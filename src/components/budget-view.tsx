"use client";

import { AssigneeAvatar } from "@/components/assignee-avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useProjectStore } from "@/lib/client-store";
import { cn } from "@/lib/utils";

const categoryLabels = {
  inventory: "Inventory & import",
  ops: "Operations",
  brand: "Brand & creative",
  growth: "Growth",
  reserve: "Reserve",
} as const;

export function BudgetView() {
  const data = useProjectStore((s) => s.data);
  const updateBudgetItem = useProjectStore((s) => s.updateBudgetItem);

  if (!data) return null;

  const estimateTotal = data.budget.reduce((s, i) => s + i.estimate, 0);
  const actualTotal = data.budget.reduce((s, i) => s + i.actual, 0);
  const remaining = data.meta.budgetCap - actualTotal;
  const pct = Math.min(100, Math.round((actualTotal / data.meta.budgetCap) * 100));

  const groups = (
    Object.keys(categoryLabels) as (keyof typeof categoryLabels)[]
  ).map((cat) => ({
    cat,
    label: categoryLabels[cat],
    items: data.budget.filter((b) => b.category === cat),
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat
          label="Budget cap"
          value={`$${data.meta.budgetCap.toLocaleString()}`}
        />
        <Stat
          label="Planned"
          value={`$${estimateTotal.toLocaleString()}`}
          hint={`${data.meta.budgetCap - estimateTotal >= 0 ? "Under" : "Over"} cap by $${Math.abs(data.meta.budgetCap - estimateTotal)}`}
        />
        <Stat label="Spent (actual)" value={`$${actualTotal.toLocaleString()}`} />
        <Stat
          label="Remaining vs cap"
          value={`$${remaining.toLocaleString()}`}
          tone={remaining < 300 ? "warn" : "ok"}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Spend vs $5k cap</span>
          <span className="text-muted-foreground">{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      {groups.map((group) => (
        <div
          key={group.cat}
          className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
        >
          <div className="border-b border-border bg-muted/40 px-4 py-2.5 text-sm font-semibold">
            {group.label}
          </div>
          <div className="divide-y divide-border">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 px-4 py-3 sm:grid-cols-[1.4fr_100px_100px_100px_1fr] sm:items-center"
              >
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <AssigneeAvatar assignee={item.owner} />
                    <span className="text-xs text-muted-foreground">
                      {item.notes}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Estimate</div>
                  <div className="text-sm font-medium">${item.estimate}</div>
                </div>
                <div>
                  <div className="mb-1 text-[11px] text-muted-foreground">
                    Actual $
                  </div>
                  <Input
                    type="number"
                    min={0}
                    value={item.actual}
                    onChange={(e) =>
                      updateBudgetItem(item.id, {
                        actual: Number(e.target.value) || 0,
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Delta</div>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      item.actual > item.estimate
                        ? "text-destructive"
                        : "text-emerald-700",
                    )}
                  >
                    {item.actual - item.estimate >= 0 ? "+" : ""}
                    ${item.actual - item.estimate}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground sm:text-right">
                  Owner tracks spend; joint call over $200
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "ok" | "warn";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-2xl font-semibold tracking-tight",
          tone === "warn" && "text-amber-700",
          tone === "ok" && "text-emerald-700",
        )}
      >
        {value}
      </div>
      {hint ? (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
