"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, CalendarDays, Clock, Building2, ExternalLink } from "lucide-react";
import { ErrorState, EmptyState, LoadingState } from "@/components/shared/StateBlocks";
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

export default function InvestorSchedulePage() {
  const { user, loading: authLoading } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;
    
    const fetchSchedule = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        // Find our investor ID
        const resList = await fetch(`${API_URL}/api/investors`);
        if (!resList.ok) throw new Error("Failed to fetch investors list");
        const investors = await resList.json();
        const myInvestorRecord = investors.find((inv: any) => inv.user_id === user.id);
        
        if (!myInvestorRecord) {
          throw new Error("Investor record not found for this user.");
        }
        
        const invId = myInvestorRecord.id;
        
        // Fetch global schedule
        const res = await fetch(`${API_URL}/api/schedule`);
        if (!res.ok) throw new Error("Failed to fetch schedule");
        
        const data = await res.json();
        
        if (data.status === "success" && Array.isArray(data.schedule)) {
          // Filter schedule to only include meetings for this investor
          const myMeetings = data.schedule.filter((m: ScheduleItem) => m.investor_id === invId);
          setSchedule(myMeetings);
        }
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An error occurred fetching schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user, authLoading]);

  if (authLoading || loading) return <LoadingState message="Loading your schedule..." />;
  if (error) return <ErrorState error={error} onRetry={() => window.location.reload()} />;

  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return <Badge variant="outline" className="text-slate-500">Pending</Badge>;
    switch(outcome) {
      case "interested": return <Badge variant="default" className="bg-emerald-500 shadow-sm border-none">Interested</Badge>;
      case "follow_up": return <Badge variant="default" className="bg-amber-500 shadow-sm border-none">Follow-up</Badge>;
      case "deal_discussion": return <Badge variant="default" className="bg-blue-500 shadow-sm border-none">Deal Discussion</Badge>;
      case "not_fit": return <Badge variant="default" className="bg-slate-400 shadow-sm border-none">Not a Fit</Badge>;
      default: return <Badge variant="outline">{outcome}</Badge>;
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold mb-4 border border-emerald-500/20 shadow-sm">
          <CalendarDays className="w-4 h-4" />
          <span>My Meetings</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1C1917] mb-3">Your Event Schedule</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Here are your confirmed meetings with startups, optimized by the MatchFlow AI engine.
        </p>
      </div>

      {schedule.length === 0 ? (
        <EmptyState 
          title="No meetings scheduled" 
          description="The Organizer has not generated the schedule yet, or no matches were found for your availability." 
        />
      ) : (
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="p-0">
            <Table>
              <TableHeader className="bg-white/50 border-b border-white/60">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-[150px] pl-8 py-5 font-bold text-slate-700">Time Slot</TableHead>
                  <TableHead className="font-bold text-slate-700">Startup</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Match Score</TableHead>
                  <TableHead className="text-right pr-8 font-bold text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.sort((a, b) => a.time_slot - b.time_slot).map((s, idx) => (
                  <TableRow key={idx} className="border-white/40 hover:bg-white/40 transition-colors">
                    <TableCell className="pl-8 font-medium">
                      <div className="flex items-center gap-2 text-slate-800">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                          <Clock className="w-4 h-4 text-emerald-600" />
                        </div>
                        Slot {s.time_slot + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/60 rounded-lg border border-white">
                          <Building2 className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="font-mono text-sm font-bold text-slate-700">{s.startup_id.substring(0, 8)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
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
