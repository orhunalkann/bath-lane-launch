import {
  Bookmark,
  Bug,
  CheckSquare,
  Layers,
  Lightbulb,
} from "lucide-react";
import type { IssueType } from "@/lib/types";
import { cn } from "@/lib/utils";

const map: Record<
  IssueType,
  { icon: typeof Bookmark; className: string; label: string }
> = {
  epic: { icon: Layers, className: "text-violet-600", label: "Epic" },
  story: { icon: Bookmark, className: "text-emerald-600", label: "Story" },
  task: { icon: CheckSquare, className: "text-sky-600", label: "Task" },
  bug: { icon: Bug, className: "text-red-600", label: "Bug" },
  decision: { icon: Lightbulb, className: "text-amber-600", label: "Decision" },
};

export function TypeIcon({
  type,
  className,
}: {
  type: IssueType;
  className?: string;
}) {
  const { icon: Icon, className: color, label } = map[type];
  return (
    <span title={label} className={cn("inline-flex", className)}>
      <Icon className={cn("size-3.5", color)} />
    </span>
  );
}
