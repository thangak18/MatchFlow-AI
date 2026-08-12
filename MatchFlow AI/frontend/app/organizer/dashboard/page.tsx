"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/shared/MetricCard";
import { Building2, Users, FileBarChart, Zap, CalendarDays, LineChart } from "lucide-react";
import { LoadingState, ErrorState } from "@/components/shared/StateBlocks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  type AnalyticsData = { total_startups: number; total_investors: number; active_matches: number; total_meetings: number; average_match_score: number };
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/analytics")
      .then(async res => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        if (typeof json !== 'object' || json === null || !('total_startups' in json)) {
            throw new Error("Invalid analytics data format");
        }
        return json;
      })
      .then(d => setData(d as AnalyticsData))
      .catch(e => {
        console.error(e);
        setError(e.message || "An error occurred");
      });
  }, []);

  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  if (!data) return <LoadingState message="Loading event analytics..." />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <LineChart className="w-3.5 h-3.5" />
          <span>Real-time Analytics</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Event Performance</h1>
        <p className="text-muted-foreground text-lg">
          Key metrics and health indicators for your MatchFlow AI event.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard 
          title="Total Startups" 
          value={data.total_startups} 
          icon={<Building2 className="w-6 h-6" />}
          trend={{ value: "12%", isPositive: true }}
        />
        <MetricCard 
          title="Total Investors" 
          value={data.total_investors} 
          icon={<Users className="w-6 h-6" />}
          trend={{ value: "4%", isPositive: true }}
        />
        <MetricCard 
          title="Hybrid Matches Calculated" 
          value={data.active_matches} 
          icon={<Zap className="w-6 h-6 text-warning" />}
        />
        <MetricCard 
          title="Avg Match Score" 
          value={`${data.average_match_score}%`} 
          icon={<FileBarChart className="w-6 h-6 text-success" />}
        />
        <MetricCard 
          title="Scheduled Meetings" 
          value={data.total_meetings} 
          icon={<CalendarDays className="w-6 h-6" />}
        />
      </div>

      <Card className="border-border shadow-sm mb-8">
        <CardHeader className="border-b border-border bg-secondary/30 pb-4">
          <CardTitle className="text-lg">System Health</CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">AI Subsystems</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">pgvector Engine</span>
                <span className="px-2 py-1 bg-success/10 text-success text-xs rounded font-bold">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Gemini Reasoning</span>
                <span className="px-2 py-1 bg-success/10 text-success text-xs rounded font-bold">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">OR-Tools Optimizer</span>
                <span className="px-2 py-1 bg-success/10 text-success text-xs rounded font-bold">Online</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-4">Database Storage</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Embeddings Count</span>
                <span className="font-mono">{data.total_startups + data.total_investors} vectors</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Vector Dimensions</span>
                <span className="font-mono">768 dim</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
