"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/matches/${params.id}`)
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
    if (score === null) return "bg-slate-200";
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-8 font-bold text-slate-500 hover:text-slate-800 hover:bg-white/50 rounded-xl px-4 py-2 transition-all" 
        onClick={() => router.push("/matches")}
      >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Matches
      </Button>
      
      {/* Hero Section */}
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] mb-10 overflow-hidden">
        <div className="bg-white/50 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/60">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold mb-5 shadow-sm border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
              <span>MatchFlow Hybrid AI</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight mb-3 text-[#1C1917]">{match.investor_name}</h1>
            <p className="text-slate-500 text-xl font-medium">
              Detailed compatibility analysis and reasoning
            </p>
          </div>
          <ScoreBadge score={match.final_score} label="Overall Match" size="lg" />
        </div>
        
        {/* Component Scores Breakdown */}
        <div className="p-10">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Score Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold flex items-center gap-2 text-slate-700">
                  <Database className="w-5 h-5 text-amber-500" /> Structured
                </span>
                <span className="font-black text-lg text-[#1C1917]">{Math.round(match.structured_score)}%</span>
              </div>
              <Progress value={match.structured_score} className="h-3 bg-white/60 shadow-inner" indicatorClassName={getScoreColor(match.structured_score)} />
              <p className="text-sm font-medium text-slate-500">Industry, Stage, Ticket Size</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-amber-500" /> Semantic
                </span>
                <span className="font-black text-lg text-[#1C1917]">{match.semantic_score !== null ? `${Math.round(match.semantic_score)}%` : 'N/A'}</span>
              </div>
              <Progress value={match.semantic_score || 0} className="h-3 bg-white/60 shadow-inner" indicatorClassName={getScoreColor(match.semantic_score)} />
              <p className="text-sm font-medium text-slate-500">pgvector nearest-neighbor</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold flex items-center gap-2 text-slate-700">
                  <BrainCircuit className="w-5 h-5 text-amber-500" /> AI Reason
                </span>
                <span className="font-black text-lg text-[#1C1917]">{match.llm_score !== null ? `${Math.round(match.llm_score)}%` : 'N/A'}</span>
              </div>
              <Progress value={match.llm_score || 0} className="h-3 bg-white/60 shadow-inner" indicatorClassName={getScoreColor(match.llm_score)} />
              <p className="text-sm font-medium text-slate-500">Gemini qualitative evaluation</p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 px-4">Why this match?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-emerald-50/50 backdrop-blur-xl border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2rem] overflow-hidden">
          <div className="p-8 border-b border-emerald-100/50">
            <h3 className="text-xl font-bold flex items-center gap-3 text-emerald-800">
              <div className="bg-emerald-100 p-2.5 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              Strengths
            </h3>
          </div>
          <div className="p-8">
            <ul className="space-y-6">
              {match.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2.5 shadow-sm"></span>
                  <span className="text-emerald-900/80 font-medium leading-relaxed">{s}</span>
                </li>
              ))}
              {(!match.strengths || match.strengths.length === 0) && (
                <li className="text-emerald-600/60 italic font-medium">No significant strengths highlighted.</li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="bg-amber-50/50 backdrop-blur-xl border border-amber-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[2rem] overflow-hidden">
          <div className="p-8 border-b border-amber-100/50">
            <h3 className="text-xl font-bold flex items-center gap-3 text-amber-800">
              <div className="bg-amber-100 p-2.5 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              Risks & Mismatches
            </h3>
          </div>
          <div className="p-8">
            <ul className="space-y-6">
              {match.risks?.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2.5 shadow-sm"></span>
                  <span className="text-amber-900/80 font-medium leading-relaxed">{r}</span>
                </li>
              ))}
              {(!match.risks || match.risks.length === 0) && (
                <li className="text-amber-600/60 italic font-medium">No significant risks identified.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
