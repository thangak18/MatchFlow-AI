"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        
        const res = await fetch(`http://localhost:8000/api/startups/${startupId}/match`, {
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

  if (loading) return <LoadingState message="Analyzing semantic embeddings and generating MatchFlow AI connections..." />;
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Investor Matches</h1>
          <p className="text-muted-foreground text-lg">
            Based on your AI-extracted profile and our hybrid matching engine.
          </p>
        </div>
        <div className="text-sm text-muted-foreground bg-secondary px-4 py-2 rounded-lg flex items-center gap-2">
          <Database className="w-4 h-4" />
          {matches.length} matches found
        </div>
      </div>
      
      <div className="space-y-6">
        {matches.map((match, idx) => (
          <Card key={match.id} className="overflow-hidden border-border transition-all hover:shadow-md group cursor-pointer" onClick={() => viewDetail(match)}>
            <div className="flex flex-col md:flex-row">
              {/* Left Content Area */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-primary" />
                      {match.investor_name}
                    </h2>
                    {idx === 0 && (
                      <span className="bg-warning/10 text-warning text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        Top Match
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      {match.strengths.slice(0, 2).map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {match.risks.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border mt-auto">
                  <ScoreBadge score={match.structured_score} label="Struct" size="sm" />
                  <ScoreBadge score={match.semantic_score} label="Semantic" size="sm" />
                  <ScoreBadge score={match.llm_score} label="AI Reason" size="sm" />
                </div>
              </div>

              {/* Right Score Area */}
              <div className="bg-secondary/30 md:w-64 p-6 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-border group-hover:bg-secondary/50 transition-colors">
                <ScoreBadge score={match.final_score} label="Match Score" size="lg" />
                <Button variant="ghost" className="w-full justify-between hover:bg-background" onClick={(e) => { e.stopPropagation(); viewDetail(match); }}>
                  View Detail
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
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
