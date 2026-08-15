"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Save, AlertCircle } from "lucide-react";
import { LoadingState } from "@/components/shared/StateBlocks";

export default function StartupProfile() {
  type StartupProfileData = Record<string, unknown> & {
    industry?: string; stage?: string; funding_requirement?: number;
    business_model?: string; description?: string; company_name?: string;
  };
  const [profile, setProfile] = useState<StartupProfileData | null>(null);
  const [isExisting, setIsExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadProfile = async () => {
      const extractedData = localStorage.getItem("extractedProfile");
      const startupId = localStorage.getItem("activeStartupId");

      if (extractedData) {
        try {
          setProfile(JSON.parse(extractedData) as StartupProfileData);
          setIsExisting(false);
          return;
        } catch {
          setError("Could not load extracted profile. Please upload again.");
        }
      } 
      
      if (startupId) {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          const res = await fetch(`${API_URL}/api/startups/${startupId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.profile) {
              setProfile({ ...data.profile, company_name: data.company_name });
              setIsExisting(true);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to load existing profile:", e);
        }
      }
      
      router.push("/startup/upload");
    };
    
    loadProfile();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const startupId = localStorage.getItem("activeStartupId");
      
      if (isExisting && startupId) {
        const res = await fetch(`${API_URL}/api/startups/${startupId}/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile)
        });
        if (!res.ok) throw new Error("Failed to update profile");
        
        // Remove extractedProfile so next time it loads from db
        localStorage.removeItem("extractedProfile");
        router.push(`/matches?startupId=${startupId}`);
      } else {
        const res = await fetch(`${API_URL}/api/startups/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile)
        });
        if (!res.ok) throw new Error("Failed to register startup");
        
        const data = await res.json();
        localStorage.setItem("activeStartupId", data.id);
        localStorage.removeItem("extractedProfile");
        
        router.push(`/matches?startupId=${data.id}`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <LoadingState message="Loading extracted profile data..." />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold mb-4 border border-amber-500/20 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>AI Extracted Profile</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-[#1C1917] mb-3">Review Your Profile</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Please review and adjust the data extracted by AI before we generate your investor matches.
        </p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden mb-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="bg-white/50 border-b border-white/60 p-6 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1C1917]">Company Details</h2>
            <p className="text-sm text-slate-500 font-medium">Core information about your startup</p>
          </div>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <Label htmlFor="company_name" className="text-sm font-bold text-slate-700">Company Name</Label>
              <Input
                id="company_name"
                value={profile.company_name || ""}
                onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                className="bg-white/60 border-white/80 focus-visible:ring-amber-500/50 h-12 rounded-xl px-4 shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="industry" className="text-sm font-bold text-slate-700">Industry</Label>
              <Input
                id="industry"
                value={profile.industry || ""}
                onChange={(e) => setProfile({...profile, industry: e.target.value})}
                className="bg-white/60 border-white/80 focus-visible:ring-amber-500/50 h-12 rounded-xl px-4 shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="stage" className="text-sm font-bold text-slate-700">Funding Stage</Label>
              <Input
                id="stage"
                value={profile.stage || ""}
                onChange={(e) => setProfile({...profile, stage: e.target.value})}
                className="bg-white/60 border-white/80 focus-visible:ring-amber-500/50 h-12 rounded-xl px-4 shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="funding_requirement" className="text-sm font-bold text-slate-700">Funding Requirement ($)</Label>
              <Input
                id="funding_requirement"
                type="number"
                value={profile.funding_requirement || ""}
                onChange={(e) => setProfile({...profile, funding_requirement: parseFloat(e.target.value) || undefined})}
                className="bg-white/60 border-white/80 focus-visible:ring-amber-500/50 h-12 rounded-xl px-4 shadow-inner"
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="business_model" className="text-sm font-bold text-slate-700">Business Model</Label>
              <Input
                id="business_model"
                value={profile.business_model || ""}
                onChange={(e) => setProfile({...profile, business_model: e.target.value})}
                className="bg-white/60 border-white/80 focus-visible:ring-amber-500/50 h-12 rounded-xl px-4 shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-bold text-slate-700">Company Description</Label>
            <Textarea
              id="description"
              className="h-40 bg-white/60 border-white/80 focus-visible:ring-amber-500/50 rounded-xl p-4 shadow-inner resize-y leading-relaxed"
              value={profile.description || ""}
              onChange={(e) => setProfile({...profile, description: e.target.value})}
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

      <div className="flex justify-end gap-4 mb-16">
        <Button 
          variant="outline" 
          onClick={() => router.push("/startup/upload")} 
          className="h-14 px-8 rounded-xl font-bold bg-white/60 border border-white/80 hover:bg-white/80 text-slate-700 shadow-sm transition-all"
        >
          Re-upload Deck
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          className="h-14 px-10 rounded-xl font-bold text-lg bg-[#1C1917] hover:bg-black text-white shadow-xl hover:shadow-2xl transition-all border-none"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Confirm & Find Matches
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
