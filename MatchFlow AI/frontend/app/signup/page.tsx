"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Loader2, Building2, Users } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"startup" | "investor" | "">("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username) return setError("Username is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");
    if (!role) return setError("Please select a role");
    
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password, role })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to create account");
      }
      
      // Save ID to local storage just in case for legacy components, but auth is cookie-based
      if (role === "startup") {
         // Optionally you could fetch the startup ID, but for now we rely on the auth route guards
      }
      
      // Redirect
      if (role === "startup") {
        router.push("/startup/profile");
      } else {
        router.push("/investor/dashboard");
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2 pb-6 border-b border-border/50">
          <div className="mx-auto bg-primary text-primary-foreground p-2 rounded-xl w-12 h-12 flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create your MatchFlow account</CardTitle>
          <CardDescription className="text-base">Join the platform to connect with the best.</CardDescription>
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
                placeholder="Enter a username"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Minimum 6 characters"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Re-enter password"
              />
            </div>
            
            <div className="pt-2">
              <label className="text-sm font-medium text-foreground mb-3 block">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("startup")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    role === "startup" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border bg-background hover:bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  <Building2 className="w-6 h-6 mb-2" />
                  <span className="font-semibold text-sm">Startup</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("investor")}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                    role === "investor" 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-border bg-background hover:bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  <Users className="w-6 h-6 mb-2" />
                  <span className="font-semibold text-sm">Investor</span>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" size="lg" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Account
            </Button>
            
            <div className="text-center pt-4 text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </div>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
