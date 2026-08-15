import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck, Database, CalendarCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob [animation-delay:2s]"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob [animation-delay:4s]"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>

      <section className="max-w-6xl w-full text-center relative z-10 py-20 flex flex-col items-center">
        
        {/* Badge */}
        <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-500">
            MatchFlow AI is Demo-Ready
          </span>
        </div>
        
        {/* Hero Title */}
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-[#1C1917] leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          AI-Powered <br className="hidden md:block" />
          Startup–Investor <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 drop-shadow-sm">Matching</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Extract profiles, rank explainable hybrid matches, and schedule conflict-free meetings automatically with state-of-the-art AI.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
          <Link href="/signin" className="w-full sm:w-auto group">
            <Button size="lg" className="w-full text-base h-16 px-10 rounded-2xl bg-[#1C1917] hover:bg-black text-white border-none font-bold shadow-xl shadow-black/10 transition-all hover:-translate-y-1 hover:shadow-2xl">
              Sign In 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto group">
            <Button size="lg" variant="outline" className="w-full text-base h-16 px-10 rounded-2xl font-bold bg-white/40 backdrop-blur-md hover:bg-white/60 border border-white/50 text-[#1C1917] shadow-lg transition-all hover:-translate-y-1">
              Create Account
            </Button>
          </Link>
        </div>
        
        {/* Features Glass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          
          <div className="p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mb-6 shadow-inner">
              <Database className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-[#1C1917]">Semantic AI Search</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              Persisted pgvector embeddings and LLM reasoning for high-fidelity matching based on deep context.
            </p>
          </div>
          
          <div className="p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-6 shadow-inner relative z-10">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-[#1C1917] relative z-10">Explainable AI</h3>
            <p className="text-slate-600 font-medium leading-relaxed relative z-10">
              Every component score is broken down into verifiable logic and structured risk analysis.
            </p>
          </div>
          
          <div className="p-8 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-inner">
              <CalendarCheck className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-3 text-[#1C1917]">Smart Scheduling</h3>
            <p className="text-slate-600 font-medium leading-relaxed">
              OR-Tools builds conflict-free event schedules maximizing total Match Score automatically.
            </p>
          </div>
          
        </div>
        


      </section>
    </main>
  );
}
