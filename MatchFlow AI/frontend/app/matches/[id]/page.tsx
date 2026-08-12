"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Database, BrainCircuit, Sparkles } from "lucide-react";
import { LoadingState, ErrorState } from "@/components/shared/StateBlocks";
import { ScoreBadge } from "@/components/shared/ScoreBadge";

type MatchData = { 
  investor_name: string; 
  structured_score: number; 
  semantic_score: number | null; 
  llm_score: number | null; 
  final_score: number; 
  strengths: string[]; 
  risks: string[]; 
  explanation: string 
};

export default function MatchDetail() {
  const [match, setMatch] = useState<MatchData | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams<{ id: string }>();

  useEffect(() => {
    fetch(`http://localhost:8000/api/matches/${params.id}`)
      .then(async response => {
        if (!response.ok) throw new Error("Match detail not found");
        return response.json() as Promise<MatchData>;
      })
      .then(setMatch)
      .catch(error => setError(error instanceof Error ? error.message : "Failed to load match"));
  }, [params.id]);

  if (error) return <ErrorState error={error} onRetry={() => router.push("/matches")} />;
  if (!match) return <LoadingState message="Loading AI reasoning details..." />;

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-muted";
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <Button variant="ghost" className="mb-6 hover:bg-secondary" onClick={() => router.push("/matches")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Matches
      </Button>
      
      {/* Hero Section */}
      <Card className="border-border shadow-sm mb-8 overflow-hidden">
        <div className="bg-secondary/30 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MatchFlow Hybrid AI</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">{match.investor_name}</h1>
            <p className="text-muted-foreground text-lg">
              Detailed compatibility analysis and reasoning
            </p>
          </div>
          <ScoreBadge score={match.final_score} label="Overall Match" size="lg" />
        </div>
        
        {/* Component Scores Breakdown */}
        <div className="p-8 bg-background">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">Score Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> Structured
                </span>
                <span className="font-bold">{Math.round(match.structured_score)}%</span>
              </div>
              <Progress value={match.structured_score} className="h-2" indicatorClassName={getScoreColor(match.structured_score)} />
              <p className="text-xs text-muted-foreground mt-1">Industry, Stage, Ticket Size</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Semantic
                </span>
                <span className="font-bold">{match.semantic_score !== null ? `${Math.round(match.semantic_score)}%` : 'N/A'}</span>
              </div>
              <Progress value={match.semantic_score || 0} className="h-2" indicatorClassName={getScoreColor(match.semantic_score)} />
              <p className="text-xs text-muted-foreground mt-1">pgvector nearest-neighbor</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-primary" /> AI Reason
                </span>
                <span className="font-bold">{match.llm_score !== null ? `${Math.round(match.llm_score)}%` : 'N/A'}</span>
              </div>
              <Progress value={match.llm_score || 0} className="h-2" indicatorClassName={getScoreColor(match.llm_score)} />
              <p className="text-xs text-muted-foreground mt-1">Gemini qualitative evaluation</p>
            </div>
            
          </div>
        </div>
      </Card>

      {/* Analysis Section */}
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Why this match?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-border shadow-sm border-t-4 border-t-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="bg-success/10 p-2 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {match.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mt-2"></span>
                  <span className="text-muted-foreground leading-relaxed text-sm">{s}</span>
                </li>
              ))}
              {(!match.strengths || match.strengths.length === 0) && (
                <li className="text-muted-foreground italic text-sm">No significant strengths highlighted.</li>
              )}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm border-t-4 border-t-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="bg-warning/10 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              Risks & Mismatches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {match.risks?.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-2"></span>
                  <span className="text-muted-foreground leading-relaxed text-sm">{r}</span>
                </li>
              ))}
              {(!match.risks || match.risks.length === 0) && (
                <li className="text-muted-foreground italic text-sm">No significant risks identified.</li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
