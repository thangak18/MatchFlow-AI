"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertTriangle, Building2, Brain, Database, ArrowUpRight } from "lucide-react";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/StateBlocks";
import { ScoreBadge } from "@/components/shared/ScoreBadge";

type MatchData = { 
  id: string; 
  investor_name: string; 
  structured_score: number; 
  semantic_score: number | null; 
  llm_score: number | null; 
  final_score: number; 
  strengths: string[]; 
  risks: string[]; 
  explanation: string 
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError("");
        
        const params = new URLSearchParams(window.location.search);
        const startupId = params.get("startupId") || localStorage.getItem("activeStartupId");
        
        if (!startupId) {
            setError("No startup ID found. Please upload a pitch deck first.");
            setLoading(false);
            return;
        }
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_URL}/api/startups/${startupId}/match`, {
          method: "POST"
        });
        
        if (!res.ok) throw new Error("Failed to generate matches. Please check the backend.");
        
        const data = await res.json();
        
        if (!Array.isArray(data)) {
            throw new Error("Invalid response shape for matches from backend.");
        }
        
        setMatches(data as MatchData[]);
      } catch (err: unknown) {
        console.error("Match error", err);
        setError(err instanceof Error ? err.message : "An error occurred fetching matches");
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const viewDetail = (match: MatchData) => {
    router.push(`/matches/${match.id}`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 text-center">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200">
        <Brain className="w-8 h-8 text-amber-500 animate-pulse" />
      </div>
      <h3 className="text-xl font-bold text-[#1C1917] mb-2">Analyzing Data Points</h3>
      <p className="text-slate-500 font-medium">Analyzing semantic embeddings and generating MatchFlow AI connections...</p>
    </div>
  );
  
  if (error) {
    const isMissingStartupId = error.includes("No startup ID found");
    return (
      <ErrorState 
        title={isMissingStartupId ? "Action Required" : "Something went wrong"}
        error={error} 
        onRetry={() => {
          if (isMissingStartupId) {
            router.push("/startup/upload");
          } else {
            window.location.reload();
          }
        }}
        retryLabel={isMissingStartupId ? "Upload Pitch Deck" : "Try Again"}
      />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold mb-4 border border-amber-500/20 shadow-sm">
            <Database className="w-4 h-4" />
            <span>{matches.length} matches found</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1C1917] mb-3">Investor Matches</h1>
          <p className="text-slate-500 text-lg">
            Based on your AI-extracted profile and our hybrid matching engine.
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {matches.map((match, idx) => (
          <div 
            key={match.id} 
            className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer group"
            onClick={() => viewDetail(match)}
          >
            <div className="flex flex-col md:flex-row">
              {/* Left Content Area */}
              <div className="flex-1 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-[#1C1917] flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-xl">
                        <Building2 className="w-6 h-6 text-amber-600" />
                      </div>
                      {match.investor_name}
                    </h2>
                    {idx === 0 && (
                      <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-4 py-2 rounded-full font-black uppercase tracking-wider shadow-md">
                        Top Match
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-3">
                      {match.strengths.slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <span className="line-clamp-2">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      {match.risks.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                          <span className="line-clamp-2">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-white/60 mt-auto">
                  <ScoreBadge score={match.structured_score} label="Struct" size="sm" />
                  <ScoreBadge score={match.semantic_score} label="Semantic" size="sm" />
                  <ScoreBadge score={match.llm_score} label="AI Reason" size="sm" />
                </div>
              </div>

              {/* Right Score Area */}
              <div className="bg-white/50 md:w-72 p-8 flex flex-row md:flex-col items-center justify-between md:justify-center gap-6 border-t md:border-t-0 md:border-l border-white/60 group-hover:bg-white/70 transition-colors">
                <ScoreBadge score={match.final_score} label="Match Score" size="lg" />
                <Button 
                  className="w-full h-12 rounded-xl font-bold bg-[#1C1917] hover:bg-black text-white shadow-lg border-none" 
                  onClick={(e) => { e.stopPropagation(); viewDetail(match); }}
                >
                  View Detail
                  <ArrowUpRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <EmptyState 
            title="No matches found" 
            description="We couldn't find any investors matching your profile criteria at this time." 
          />
        )}
      </div>
    </div>
  );
}
