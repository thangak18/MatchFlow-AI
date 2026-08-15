"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Calendar, Clock, Sparkles } from "lucide-react";
import { ErrorState, EmptyState } from "@/components/shared/StateBlocks";
import { ScoreBadge } from "@/components/shared/ScoreBadge";
import { Badge } from "@/components/ui/badge";

type ScheduleItem = { 
  meeting_id: string; 
  startup_id: string; 
  investor_id: string; 
  time_slot: number; 
  match_score: number;
  status: string;
  outcome: string | null;
};

export default function StartupSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const fetchSchedule = async () => {
    setLoading(true);
    setError("");
    const startupId = localStorage.getItem("activeStartupId");
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/schedule`);
      if (!res.ok) throw new Error("Failed to fetch schedule");
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.schedule)) {
        // Filter by startupId if available, otherwise just show empty or all if demo
        if (startupId) {
          setSchedule(data.schedule.filter((s: ScheduleItem) => s.startup_id === startupId));
        } else {
          // Fallback for demo: show first few or all if we don't have activeStartupId
          setSchedule(data.schedule);
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred fetching schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return <Badge variant="outline" className="text-slate-500 border-slate-300">Pending</Badge>;
    switch(outcome) {
      case "interested": return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Interested</Badge>;
      case "follow_up": return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">Follow-up</Badge>;
      case "deal_discussion": return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Deal Discussion</Badge>;
      case "not_fit": return <Badge variant="default" className="bg-slate-400 hover:bg-slate-500">Not a Fit</Badge>;
      default: return <Badge variant="outline">{outcome}</Badge>;
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto relative">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold mb-4 border border-amber-500/20 shadow-sm">
          <Calendar className="w-4 h-4" />
          <span>Meeting Schedule</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1C1917] mb-3">Your Upcoming Meetings</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Here are your scheduled meetings with investors based on your Match Scores.
        </p>
      </div>

      {error && <div className="mb-8"><ErrorState error={error} onRetry={fetchSchedule} /></div>}

      {!error && schedule.length === 0 && !loading && (
        <EmptyState 
          title="No meetings scheduled yet" 
          description="The organizer has not published the event schedule yet. Please check back later." 
        />
      )}
      
      {loading && schedule.length === 0 && (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>
      )}

      {schedule.length > 0 && (
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="bg-white/50 border-b border-white/60 p-6 px-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1C1917]">Scheduled Sessions</h2>
              <p className="text-sm text-slate-500 font-medium">Your assigned time slots and investor details</p>
            </div>
          </div>
          
          <div className="p-0">
            <Table>
              <TableHeader className="bg-white/40">
                <TableRow className="border-white/60 hover:bg-transparent">
                  <TableHead className="w-[150px] pl-8 font-bold text-slate-700">Time Slot</TableHead>
                  <TableHead className="font-bold text-slate-700">Investor ID</TableHead>
                  <TableHead className="text-center font-bold text-slate-700">Match Score</TableHead>
                  <TableHead className="text-right pr-8 font-bold text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.sort((a, b) => a.time_slot - b.time_slot).map((s, idx) => (
                  <TableRow key={idx} className="border-white/40 hover:bg-white/40 transition-colors">
                    <TableCell className="pl-8 font-medium">
                      <div className="flex items-center gap-2 text-slate-800">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                          <Clock className="w-4 h-4 text-amber-600" />
                        </div>
                        Slot {s.time_slot + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm font-semibold text-slate-600">{s.investor_id.substring(0, 8)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <ScoreBadge score={s.match_score} size="sm" showLabel={false} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      {getOutcomeBadge(s.outcome)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
