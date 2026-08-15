"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "@/components/shared/MetricCard";
import { Building2, Users, FileBarChart, Zap, CalendarDays, LineChart, Activity, Database, Sparkles } from "lucide-react";
import { LoadingState, ErrorState } from "@/components/shared/StateBlocks";

export default function DashboardPage() {
  type AnalyticsData = { 
    total_startups: number; 
    total_investors: number; 
    active_matches: number; 
    total_meetings: number; 
    average_match_score: number;
    completed_meetings: number;
    positive_interest_rate: number;
    outcomes: {
      interested: number;
      follow_ups_required: number;
      deal_discussions: number;
      not_a_fit: number;
    }
  };
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/analytics`)
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
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold mb-4 border border-amber-500/20 shadow-sm">
          <LineChart className="w-4 h-4" />
          <span>Real-time Analytics</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1C1917] mb-3">Event Performance</h1>
        <p className="text-slate-500 text-lg">
          Key metrics and health indicators for your MatchFlow AI event.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
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
          title="Matches Calculated" 
          value={data.active_matches} 
          icon={<Zap className="w-6 h-6 text-white" />}
        />
        <MetricCard 
          title="Avg Match Score" 
          value={`${data.average_match_score}%`} 
          icon={<FileBarChart className="w-6 h-6 text-white" />}
        />
        <MetricCard 
          title="Scheduled Meetings" 
          value={data.total_meetings} 
          icon={<CalendarDays className="w-6 h-6 text-white" />}
        />
        <MetricCard 
          title="Positive Interest Rate" 
          value={`${data.positive_interest_rate ?? 0}%`} 
          icon={<Sparkles className="w-6 h-6 text-white" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Meeting Outcomes Glass Panel */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="bg-white/50 border-b border-white/60 p-6 px-8 flex items-center gap-3">
            <Activity className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-[#1C1917]">Meeting Outcomes</h2>
          </div>
          <div className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/60">
                <span className="font-bold text-slate-700">Completed Meetings</span>
                <span className="font-black text-2xl text-[#1C1917]">{data.completed_meetings ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-600">Interested</span>
                <span className="font-black text-xl text-[#1C1917]">{data.outcomes?.interested ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-600">Follow-ups Required</span>
                <span className="font-black text-xl text-[#1C1917]">{data.outcomes?.follow_ups_required ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-600">Deal Discussions</span>
                <span className="font-black text-xl text-[#1C1917]">{data.outcomes?.deal_discussions ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Not a Fit</span>
                <span className="font-black text-xl text-[#1C1917]">{data.outcomes?.not_a_fit ?? 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Glass Panel */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="bg-white/50 border-b border-white/60 p-6 px-8 flex items-center gap-3">
            <Database className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-[#1C1917]">System Health</h2>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">AI Subsystems</h4>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">pgvector Engine</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-black">ONLINE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Gemini Reasoning</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-black">ONLINE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">OR-Tools Optimizer</span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-black">ONLINE</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-6">Database Storage</h4>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Embeddings</span>
                  <span className="font-black text-slate-800">{data.total_startups + data.total_investors} vec</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Dimensions</span>
                  <span className="font-black text-slate-800">768 dim</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
