import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, Minus } from "lucide-react";
import type { Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const map: Record<
  Priority,
  { icon: typeof ArrowUp; className: string; label: string }
> = {
  highest: { icon: ChevronsUp, className: "text-red-600", label: "Highest" },
  high: { icon: ArrowUp, className: "text-orange-600", label: "High" },
  medium: { icon: Minus, className: "text-amber-500", label: "Medium" },
  low: { icon: ArrowDown, className: "text-sky-600", label: "Low" },
  lowest: { icon: ChevronsDown, className: "text-slate-400", label: "Lowest" },
};

export function PriorityIcon({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  const { icon: Icon, className: color, label } = map[priority];
  return (
    <span title={label} className={cn("inline-flex", className)}>
      <Icon className={cn("size-3.5", color)} />
    </span>
  );
}
