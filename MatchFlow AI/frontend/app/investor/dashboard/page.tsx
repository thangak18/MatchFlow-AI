"use client";

import { useAuth } from "@/lib/useAuth";
import { Users, Loader2, Sparkles } from "lucide-react";

export default function InvestorDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold mb-4 border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Investor Portal</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1C1917]">Welcome, {user?.username}</h1>
          <p className="text-slate-500 text-lg mt-2">
            View your investment matches and portfolio opportunities.
          </p>
        </div>
      </div>
      
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="bg-white/50 border-b border-white/60 p-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-[#1C1917]">Your Matches</h2>
          </div>
          <p className="text-slate-500 font-medium">
            The MatchFlow AI engine is actively searching for startups matching your thesis.
          </p>
        </div>
        <div className="p-10">
          <div className="p-12 text-center bg-white/40 border-2 border-dashed border-white/80 rounded-3xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200">
              <Sparkles className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Awaiting AI Matches</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto">
              Match notifications will appear here. The Organizer manages the global schedule. Sit back while we find your next unicorn!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
