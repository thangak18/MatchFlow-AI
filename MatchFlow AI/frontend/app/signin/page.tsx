"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Building2, Users, LayoutDashboard } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) return setError("Username and password are required");
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to sign in");
      }
      
      // Redirect based on returned role
      if (data.role === "startup") {
        router.push("/startup/profile");
      } else if (data.role === "investor") {
        router.push("/investor/dashboard");
      } else if (data.role === "organizer") {
        router.push("/organizer/dashboard");
      } else {
        router.push("/");
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (user: string) => {
    setUsername(user);
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2 pb-6 border-b border-border/50">
          <div className="mx-auto bg-primary text-primary-foreground p-2 rounded-xl w-12 h-12 flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-base">Sign in to your MatchFlow account</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="p-3 text-sm text-danger bg-danger/10 rounded-md border border-danger/20 font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your username"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sign In
            </Button>
            
            <div className="text-center pt-4 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-semibold">
                Create account
              </Link>
            </div>
            
          </form>
          
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 text-center">Demo Accounts</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button" 
                onClick={() => fillDemo("startup_demo")}
                className="flex flex-col items-center justify-center p-2 rounded bg-secondary/50 hover:bg-secondary transition-colors border border-border"
              >
                <Building2 className="w-4 h-4 mb-1 text-muted-foreground" />
                <span className="text-[10px] font-medium leading-tight">Startup Demo</span>
              </button>
              <button 
                type="button" 
                onClick={() => fillDemo("investor_demo")}
                className="flex flex-col items-center justify-center p-2 rounded bg-secondary/50 hover:bg-secondary transition-colors border border-border"
              >
                <Users className="w-4 h-4 mb-1 text-muted-foreground" />
                <span className="text-[10px] font-medium leading-tight">Investor Demo</span>
              </button>
              <button 
                type="button" 
                onClick={() => fillDemo("organizer_demo")}
                className="flex flex-col items-center justify-center p-2 rounded bg-secondary/50 hover:bg-secondary transition-colors border border-border"
              >
                <LayoutDashboard className="w-4 h-4 mb-1 text-muted-foreground" />
                <span className="text-[10px] font-medium leading-tight">Organizer Demo</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
