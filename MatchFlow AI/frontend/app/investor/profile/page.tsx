"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Loader2, Save, AlertCircle } from "lucide-react";
import { LoadingState } from "@/components/shared/StateBlocks";

type InvestorProfileData = {
  investment_thesis?: string;
  preferred_industries?: string[];
  preferred_stages?: string[];
  min_ticket_size?: number;
  max_ticket_size?: number;
  preferred_geographies?: string[];
  business_model_preferences?: string[];
  technology_interests?: string[];
};

export default function InvestorProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<InvestorProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // We'll manage lists as comma-separated strings in the UI for simplicity
  const [industriesStr, setIndustriesStr] = useState("");
  const [stagesStr, setStagesStr] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchProfile = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        // User's username is the username, but the investor_id is stored in db.
        // Wait, the JWT token only has { sub (user_id), username, role }
        // We need the investor ID. `GET /api/investors` to find our investor_id.
        const resList = await fetch(`${API_URL}/api/investors`);
        if (!resList.ok) throw new Error("Failed to fetch investors list");
        const investors = await resList.json();
        
        // Find the investor record that belongs to this user
        const myInvestorRecord = investors.find((inv: any) => inv.user_id === user.id);
        
        if (myInvestorRecord) {
          // Store investor_id globally if needed, but we can just use it here
          const invId = myInvestorRecord.id;
          
          const res = await fetch(`${API_URL}/api/investors/${invId}`);
          if (!res.ok) throw new Error("Failed to fetch profile");
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
            setIndustriesStr(data.profile.preferred_industries?.join(", ") || "");
            setStagesStr(data.profile.preferred_stages?.join(", ") || "");
          } else {
            setProfile({});
          }
        } else {
          setError("Investor record not found for this user.");
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to load profile.");
      }
    };
    fetchProfile();
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!profile || !user) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const resList = await fetch(`${API_URL}/api/investors`);
      const investors = await resList.json();
      const myInvestorRecord = investors.find((inv: any) => inv.user_id === user.id);
      
      if (!myInvestorRecord) throw new Error("Investor ID not found");
      
      const payload = {
        ...profile,
        preferred_industries: industriesStr.split(",").map(s => s.trim()).filter(Boolean),
        preferred_stages: stagesStr.split(",").map(s => s.trim()).filter(Boolean),
      };
      
      const res = await fetch(`${API_URL}/api/investors/${myInvestorRecord.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save profile");
      setSuccessMsg("Profile updated successfully!");
      
    } catch (e: any) {
      setError(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !profile) return <LoadingState message="Loading investor profile..." />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold mb-4 border border-emerald-500/20 shadow-sm">
          <Briefcase className="w-4 h-4" />
          <span>Investor Preferences</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1C1917] mb-3">Investment Thesis</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Define your target criteria. The AI will use this data to calculate Semantic and LLM matches with Startups.
        </p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden mb-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="bg-white/50 border-b border-white/60 p-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#1C1917]">Target Criteria</h2>
            <p className="text-slate-500 font-medium">Core information about your thesis</p>
          </div>
        </div>
        
        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <Label htmlFor="industries" className="text-sm font-bold text-slate-700">Preferred Industries (comma separated)</Label>
              <Input
                id="industries"
                placeholder="e.g. Fintech, AI, Healthtech"
                value={industriesStr}
                onChange={(e) => setIndustriesStr(e.target.value)}
                className="bg-white/60 border-white/80 focus-visible:ring-emerald-500/50 h-12 rounded-xl px-4 shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="stages" className="text-sm font-bold text-slate-700">Preferred Stages (comma separated)</Label>
              <Input
                id="stages"
                placeholder="e.g. Seed, Series A"
                value={stagesStr}
                onChange={(e) => setStagesStr(e.target.value)}
                className="bg-white/60 border-white/80 focus-visible:ring-emerald-500/50 h-12 rounded-xl px-4 shadow-inner"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="min_ticket" className="text-sm font-bold text-slate-700">Min Ticket Size ($)</Label>
              <Input
                id="min_ticket"
                type="number"
                value={profile.min_ticket_size || ""}
                onChange={(e) => setProfile({...profile, min_ticket_size: parseFloat(e.target.value) || undefined})}
                className="bg-white/60 border-white/80 focus-visible:ring-emerald-500/50 h-12 rounded-xl px-4 shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="max_ticket" className="text-sm font-bold text-slate-700">Max Ticket Size ($)</Label>
              <Input
                id="max_ticket"
                type="number"
                value={profile.max_ticket_size || ""}
                onChange={(e) => setProfile({...profile, max_ticket_size: parseFloat(e.target.value) || undefined})}
                className="bg-white/60 border-white/80 focus-visible:ring-emerald-500/50 h-12 rounded-xl px-4 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="thesis" className="text-sm font-bold text-slate-700">Investment Thesis / Description</Label>
            <Textarea
              id="thesis"
              placeholder="Describe what kind of founders and problems you are looking to back..."
              className="h-40 bg-white/60 border-white/80 focus-visible:ring-emerald-500/50 rounded-xl p-4 shadow-inner resize-y leading-relaxed"
              value={profile.investment_thesis || ""}
              onChange={(e) => setProfile({...profile, investment_thesis: e.target.value})}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}
      
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      <div className="flex justify-end mb-16">
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="h-14 px-10 rounded-xl font-bold text-lg bg-[#1C1917] hover:bg-black text-white shadow-xl hover:shadow-2xl transition-all border-none"
        >
          {saving ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-5 h-5 mr-2" /> Save Profile</>
          )}
        </Button>
      </div>
    </div>
  );
}
