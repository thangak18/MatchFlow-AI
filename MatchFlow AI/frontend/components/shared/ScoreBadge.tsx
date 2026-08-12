import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | null | undefined;
  label?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ScoreBadge({ score, label, size = "md", showLabel = true }: ScoreBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <div className={cn("inline-flex items-center flex-col", size === "lg" ? "gap-2" : "gap-1")}>
        <div className={cn(
          "font-bold text-muted-foreground bg-secondary flex items-center justify-center rounded-lg",
          size === "sm" && "text-xs px-2 py-1",
          size === "md" && "text-sm px-3 py-1.5",
          size === "lg" && "text-2xl px-6 py-4 rounded-xl"
        )}>
          N/A
        </div>
        {showLabel && label && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
            {label}
          </span>
        )}
      </div>
    );
  }

  // Determine color based on score
  let colorClass = "text-success bg-success/10 border-success/20";
  if (score < 60) colorClass = "text-danger bg-danger/10 border-danger/20";
  else if (score < 80) colorClass = "text-warning bg-warning/10 border-warning/20";
  else colorClass = "text-primary bg-primary/10 border-primary/20"; // Excellent match (using primary as per premium feel, or success)

  // Use success green for top tier matches to pop
  if (score >= 85) {
    colorClass = "text-success bg-success/10 border-success/20";
  }

  return (
    <div className={cn("inline-flex items-center flex-col", size === "lg" ? "gap-2" : "gap-1")}>
      <div className={cn(
        "font-bold flex items-center justify-center rounded-lg border",
        colorClass,
        size === "sm" && "text-xs px-2 py-1",
        size === "md" && "text-sm px-3 py-1.5",
        size === "lg" && "text-3xl px-6 py-4 rounded-xl"
      )}>
        {Math.round(score)}%
      </div>
      {showLabel && label && (
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
          {label}
        </span>
      )}
    </div>
  );
}
