"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      const res = await fetch("http://localhost:8000/api/schedule");
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
      const res = await fetch("http://localhost:8000/api/schedule/generate", {
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
      const res = await fetch(`http://localhost:8000/api/meetings/${selectedMeeting.meeting_id}/outcome`, {
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
      case "interested": return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Interested</Badge>;
      case "follow_up": return <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">Follow-up</Badge>;
      case "deal_discussion": return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">Deal Discussion</Badge>;
      case "not_fit": return <Badge variant="default" className="bg-slate-400 hover:bg-slate-500">Not a Fit</Badge>;
      default: return <Badge variant="outline">{outcome}</Badge>;
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto relative">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>Organizer Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Event Schedule Optimization</h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Use the OR-Tools constraint satisfaction solver to generate conflict-free meeting schedules that maximize overall Match Scores.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <Button 
          onClick={generateSchedule} 
          disabled={isGenerating} 
          size="lg" 
          className="text-base font-semibold shadow-md shadow-primary/20 h-14 px-8"
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
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      )}

      {schedule.length > 0 && (
        <Card className="border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[120px] pl-6 font-semibold">Time Slot</TableHead>
                  <TableHead className="font-semibold">Startup</TableHead>
                  <TableHead className="font-semibold">Investor</TableHead>
                  <TableHead className="text-right font-semibold">Match Score</TableHead>
                  <TableHead className="text-right pr-6 font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.sort((a, b) => a.time_slot - b.time_slot).map((s, idx) => (
                  <TableRow key={idx} className="hover:bg-secondary/20">
                    <TableCell className="pl-6 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        Slot {s.time_slot + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.startup_id.substring(0, 8)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.investor_id.substring(0, 8)}</TableCell>
                    <TableCell className="text-right">
                      <ScoreBadge score={s.match_score} size="sm" showLabel={false} />
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      {s.status === "completed" ? (
                        <div className="flex items-center justify-end gap-2">
                          {getOutcomeBadge(s.outcome)}
                          <Button variant="ghost" size="sm" onClick={() => openOutcomeModal(s)}>Edit</Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => openOutcomeModal(s)}>Record Outcome</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="bg-background w-full max-w-md rounded-xl shadow-2xl p-6 relative">
            <button onClick={closeOutcomeModal} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Meeting Outcome</h2>
            <div className="mb-6 p-4 bg-secondary/30 rounded-lg flex justify-between items-center text-sm font-mono">
              <span>{selectedMeeting.startup_id.substring(0, 8)}</span>
              <span className="mx-2 text-muted-foreground">↔</span>
              <span>{selectedMeeting.investor_id.substring(0, 8)}</span>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Outcome</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "interested", label: "Interested" },
                    { id: "follow_up", label: "Follow-up Required" },
                    { id: "deal_discussion", label: "Deal Discussion" },
                    { id: "not_fit", label: "Not a Fit" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setOutcome(opt.id)}
                      className={`px-3 py-2 text-sm rounded-md border text-center transition-all ${
                        outcome === opt.id 
                          ? 'border-primary bg-primary/10 text-primary font-medium' 
                          : 'border-input hover:bg-secondary/50 text-muted-foreground'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                <textarea
                  className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Enter meeting notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeOutcomeModal}>Cancel</Button>
              <Button onClick={saveOutcome} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Outcome
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
