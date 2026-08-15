"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Calendar, Clock, Sparkles, X } from "lucide-react";
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

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedMeeting, setSelectedMeeting] = useState<ScheduleItem | null>(null);
  const [outcome, setOutcome] = useState("interested");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/schedule`);
      if (!res.ok) throw new Error("Failed to fetch schedule");
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.schedule)) {
        setSchedule(data.schedule);
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

  const generateSchedule = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/schedule/generate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to generate schedule");
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.schedule)) {
        setSchedule(data.schedule);
      } else {
        throw new Error("Invalid schedule data format");
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const openOutcomeModal = (meeting: ScheduleItem) => {
    setSelectedMeeting(meeting);
    setOutcome(meeting.outcome || "interested");
    setNotes("");
  };

  const closeOutcomeModal = () => {
    setSelectedMeeting(null);
  };

  const saveOutcome = async () => {
    if (!selectedMeeting) return;
    setIsSaving(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/meetings/${selectedMeeting.meeting_id}/outcome`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, notes })
      });
      if (!res.ok) throw new Error("Failed to save outcome");
      const data = await res.json();
      
      setSchedule(schedule.map(m => m.meeting_id === selectedMeeting.meeting_id ? { ...m, outcome: data.outcome, status: "completed" } : m));
      closeOutcomeModal();
    } catch (err) {
      console.error("Error saving outcome:", err);
      alert("Error saving outcome");
    } finally {
      setIsSaving(false);
    }
  };
  
  const getOutcomeBadge = (outcome: string | null) => {
    if (!outcome) return null;
    switch(outcome) {
      case "interested": return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 shadow-sm border-none">Interested</Badge>;
      case "follow_up": return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 shadow-sm border-none">Follow-up</Badge>;
      case "deal_discussion": return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 shadow-sm border-none">Deal Discussion</Badge>;
      case "not_fit": return <Badge variant="default" className="bg-slate-400 hover:bg-slate-500 shadow-sm border-none">Not a Fit</Badge>;
      default: return <Badge variant="outline">{outcome}</Badge>;
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto relative">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold mb-4 border border-amber-500/20 shadow-sm">
          <Calendar className="w-4 h-4" />
          <span>Organizer Dashboard</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1C1917] mb-3">Event Schedule Optimization</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Use the OR-Tools constraint satisfaction solver to generate conflict-free meeting schedules that maximize overall Match Scores.
        </p>
      </div>

      <div className="mb-10 flex justify-center">
        <Button 
          onClick={generateSchedule} 
          disabled={isGenerating} 
          className="h-14 px-10 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 transition-all text-white border-none"
        >
          {isGenerating ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Optimizing via OR-Tools...</>
          ) : (
            <><Sparkles className="w-5 h-5 mr-2" />Generate Optimized Schedule</>
          )}
        </Button>
      </div>

      {error && <div className="mb-8"><ErrorState error={error} onRetry={generateSchedule} /></div>}

      {!error && schedule.length === 0 && !loading && (
        <EmptyState 
          title="No schedule generated yet" 
          description="Click the button above to run the optimization algorithm and assign time slots." 
        />
      )}
      
      {loading && schedule.length === 0 && (
        <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>
      )}

      {schedule.length > 0 && (
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <div className="p-0">
            <Table>
              <TableHeader className="bg-white/50 border-b border-white/60">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-[120px] pl-8 py-5 font-bold text-slate-700">Time Slot</TableHead>
                  <TableHead className="font-bold text-slate-700">Startup</TableHead>
                  <TableHead className="font-bold text-slate-700">Investor</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Match Score</TableHead>
                  <TableHead className="text-right pr-8 font-bold text-slate-700">Action</TableHead>
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
                    <TableCell className="font-mono text-sm font-semibold text-slate-600">{s.startup_id.substring(0, 8)}</TableCell>
                    <TableCell className="font-mono text-sm font-semibold text-slate-600">{s.investor_id.substring(0, 8)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ScoreBadge score={s.match_score} size="sm" showLabel={false} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      {s.status === "completed" ? (
                        <div className="flex items-center justify-end gap-3">
                          {getOutcomeBadge(s.outcome)}
                          <Button variant="ghost" size="sm" onClick={() => openOutcomeModal(s)} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 font-bold">Edit</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => openOutcomeModal(s)} className="bg-white/60 border-white/80 hover:bg-white/80 text-slate-700 font-bold rounded-lg shadow-sm">Record Outcome</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-lg rounded-[2rem] shadow-2xl border border-white/60 p-8 relative">
            <button onClick={closeOutcomeModal} className="absolute right-6 top-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-[#1C1917] mb-6">Meeting Outcome</h2>
            <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-sm font-mono shadow-inner">
              <span className="font-bold text-slate-700">{selectedMeeting.startup_id.substring(0, 8)}</span>
              <span className="mx-2 text-amber-500 font-black">↔</span>
              <span className="font-bold text-slate-700">{selectedMeeting.investor_id.substring(0, 8)}</span>
            </div>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">Select Outcome</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "interested", label: "Interested" },
                    { id: "follow_up", label: "Follow-up Required" },
                    { id: "deal_discussion", label: "Deal Discussion" },
                    { id: "not_fit", label: "Not a Fit" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setOutcome(opt.id)}
                      className={`px-4 py-3 text-sm rounded-xl border text-center transition-all font-bold shadow-sm ${
                        outcome === opt.id 
                          ? 'border-amber-500 bg-amber-500 text-white shadow-md' 
                          : 'border-slate-200 bg-white hover:border-amber-300 text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700 mb-3 block">Notes (Optional)</label>
                <textarea
                  className="w-full flex min-h-[100px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 shadow-sm"
                  placeholder="Enter meeting notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button variant="ghost" onClick={closeOutcomeModal} className="h-12 px-6 rounded-xl font-bold text-slate-500 hover:bg-slate-100">Cancel</Button>
              <Button onClick={saveOutcome} disabled={isSaving} className="h-12 px-8 rounded-xl font-bold bg-[#1C1917] hover:bg-black text-white shadow-lg border-none">
                {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                Save Outcome
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
