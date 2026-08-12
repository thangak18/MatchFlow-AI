"use client";

import { useAuth } from "@/lib/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Loader2 } from "lucide-react";

export default function InvestorDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome, {user?.username}</h1>
          <p className="text-muted-foreground mt-2">
            View your investment matches and portfolio opportunities.
          </p>
        </div>
      </div>
      
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Your Matches
          </CardTitle>
          <CardDescription>
            The MatchFlow AI engine is actively searching for startups matching your thesis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
            Match notifications will appear here. The Organizer manages the global schedule.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
