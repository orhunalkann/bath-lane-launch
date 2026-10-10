import type { Assignee } from "@/lib/types";
import { ASSIGNEES } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AssigneeAvatar({
  assignee,
  size = "sm",
  showLabel = false,
}: {
  assignee: Assignee;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const meta = ASSIGNEES.find((a) => a.id === assignee) ?? ASSIGNEES[3];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold text-white",
          size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs",
        )}
        style={{ backgroundColor: meta.color }}
        title={meta.label}
      >
        {meta.initials}
      </span>
      {showLabel ? (
        <span className="text-sm text-foreground">{meta.label}</span>
      ) : null}
    </span>
  );
}
