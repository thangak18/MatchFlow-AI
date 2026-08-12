"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Calendar, Clock, Sparkles } from "lucide-react";
import { ErrorState, EmptyState } from "@/components/shared/StateBlocks";
import { ScoreBadge } from "@/components/shared/ScoreBadge";

type ScheduleItem = { startup_id: string; investor_id: string; time_slot: number; match_score: number };

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateSchedule = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
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

      <div className="mb-8">
        <Button 
          onClick={generateSchedule} 
          disabled={loading} 
          size="lg" 
          className="text-base font-semibold shadow-md shadow-primary/20 h-14 px-8"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Optimizing via OR-Tools...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Optimized Schedule
            </>
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

      {schedule.length > 0 && (
        <Card className="border-border shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="w-[150px] pl-6 font-semibold">Time Slot</TableHead>
                  <TableHead className="font-semibold">Startup (ID)</TableHead>
                  <TableHead className="font-semibold">Investor (ID)</TableHead>
                  <TableHead className="text-right pr-6 font-semibold">Match Score</TableHead>
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
                    <TableCell className="font-mono text-xs text-muted-foreground bg-secondary/10 py-1 px-2 rounded w-min inline-block mt-3">{s.startup_id.substring(0, 8)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{s.investor_id.substring(0, 8)}</TableCell>
                    <TableCell className="text-right pr-6">
                      <ScoreBadge score={s.match_score} size="sm" showLabel={false} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
