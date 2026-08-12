"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("extractedProfile");
    if (data) {
      try {
        setProfile(JSON.parse(data) as StartupProfileData);
      } catch {
        setError("Could not load extracted profile. Please upload again.");
      }
    } else {
      router.push("/startup/upload");
    }
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/startups/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error("Failed to register startup");
      
      const data = await res.json();
      localStorage.setItem("activeStartupId", data.id);
      router.push(`/matches?startupId=${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <LoadingState message="Loading extracted profile data..." />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Extracted Profile</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Review Your Profile</h1>
        <p className="text-muted-foreground text-lg">
          Please review and adjust the data extracted by AI before we generate your investor matches.
        </p>
      </div>

      <Card className="border-border shadow-sm mb-8">
        <CardHeader className="bg-secondary/30 border-b border-border pb-4">
          <CardTitle>Company Details</CardTitle>
          <CardDescription>Core information about your startup</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-3">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={profile.company_name || ""}
                onChange={(e) => setProfile({...profile, company_name: e.target.value})}
                className="bg-background"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={profile.industry || ""}
                onChange={(e) => setProfile({...profile, industry: e.target.value})}
                className="bg-background"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="stage">Funding Stage</Label>
              <Input
                id="stage"
                value={profile.stage || ""}
                onChange={(e) => setProfile({...profile, stage: e.target.value})}
                className="bg-background"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="funding_requirement">Funding Requirement ($)</Label>
              <Input
                id="funding_requirement"
                type="number"
                value={profile.funding_requirement || ""}
                onChange={(e) => setProfile({...profile, funding_requirement: parseFloat(e.target.value) || undefined})}
                className="bg-background"
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <Label htmlFor="business_model">Business Model</Label>
              <Input
                id="business_model"
                value={profile.business_model || ""}
                onChange={(e) => setProfile({...profile, business_model: e.target.value})}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              className="h-40 bg-background resize-y"
              value={profile.description || ""}
              onChange={(e) => setProfile({...profile, description: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 p-4 bg-danger/10 text-danger rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-4 mb-16">
        <Button variant="outline" onClick={() => router.push("/startup/upload")} className="h-12 px-6">
          Re-upload Deck
        </Button>
        <Button onClick={handleSave} disabled={saving} className="h-12 px-8 text-base font-semibold shadow-md">
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Confirm & Find Matches
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
