"use client";

import { Sidebar } from "./Sidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/useAuth";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex w-full relative overflow-hidden font-sans">
      {/* Dashboard Animated Background Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob [animation-delay:2s] pointer-events-none"></div>
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob [animation-delay:4s] pointer-events-none"></div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none"></div>

      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Top Header */}
        <header className="h-16 bg-white/40 backdrop-blur-xl border-b border-white/60 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="search"
                placeholder="Search startups or investors..."
                className="w-full bg-white/60 border border-white/80 pl-10 rounded-full focus-visible:ring-1 focus-visible:ring-amber-500/50 shadow-inner"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-white/60">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#FAFAF9]"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-md cursor-pointer hover:shadow-lg transition-all">
              {user ? user.username.substring(0, 2).toUpperCase() : "U"}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
