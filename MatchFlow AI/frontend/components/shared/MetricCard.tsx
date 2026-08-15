import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
    <div className={cn(
      "bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]",
      className
    )}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-black tracking-tight text-[#1C1917]">{value}</p>
          </div>
          {icon && (
            <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl text-white shadow-md">
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div className="mt-6 flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-bold px-2 py-1 rounded-lg",
                trend.isPositive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}
            </span>
            <span className="text-sm text-slate-500 font-medium">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
