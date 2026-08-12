import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Database } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/50 blur-3xl" />
      
      <section className="max-w-5xl text-center relative z-10">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-secondary text-primary font-semibold text-sm mb-8 border border-border shadow-sm">
          <Sparkles className="w-4 h-4 text-warning" />
          <span>MatchFlow AI is Demo-Ready</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-primary">
          AI-Powered Startup–Investor <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary-foreground">Matching</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-medium">
          Extract profiles, rank explainable hybrid matches, and schedule conflict-free meetings automatically.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/signin" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-base h-14 px-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground border-none font-bold shadow-lg shadow-primary/20">
              Sign In
            </Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-base h-14 px-12 rounded-xl font-bold bg-background/50 hover:bg-secondary border-border">
              Create Account
            </Button>
          </Link>
        </div>
        
        <div className="mb-16 bg-secondary/30 p-4 rounded-xl inline-block text-left border border-border text-sm shadow-sm max-w-sm">
          <div className="flex items-center gap-2 font-bold mb-2 text-foreground">
            <ShieldCheck className="w-4 h-4 text-warning" />
            Demo Access (Password: demo123)
          </div>
          <ul className="space-y-1 text-muted-foreground font-mono">
            <li>• Startup: <span className="text-foreground">startup_demo</span></li>
            <li>• Investor: <span className="text-foreground">investor_demo</span></li>
            <li>• Organizer: <span className="text-foreground">organizer_demo</span></li>
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
          <div className="p-6 bg-surface border border-border rounded-xl shadow-sm">
            <Database className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-bold text-lg mb-2 text-foreground">Semantic AI Search</h3>
            <p className="text-sm text-muted-foreground">Persisted pgvector embeddings and LLM reasoning for high-fidelity matching.</p>
          </div>
          <div className="p-6 bg-surface border border-border rounded-xl shadow-sm">
            <ShieldCheck className="w-8 h-8 text-success mb-4" />
            <h3 className="font-bold text-lg mb-2 text-foreground">Explainable AI</h3>
            <p className="text-sm text-muted-foreground">Every component score is broken down into verifiable logic and structured risk analysis.</p>
          </div>
          <div className="p-6 bg-surface border border-border rounded-xl shadow-sm">
            <Sparkles className="w-8 h-8 text-warning mb-4" />
            <h3 className="font-bold text-lg mb-2 text-foreground">Smart Scheduling</h3>
            <p className="text-sm text-muted-foreground">OR-Tools builds conflict-free event schedules maximizing total Match Score.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
