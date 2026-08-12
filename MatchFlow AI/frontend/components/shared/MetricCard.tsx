import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          </div>
          {icon && (
            <div className="p-3 bg-secondary rounded-lg text-primary">
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-success" : "text-danger"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}
            </span>
            <span className="text-sm text-muted-foreground">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
