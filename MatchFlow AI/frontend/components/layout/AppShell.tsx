"use client";

import { Sidebar } from "./Sidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-40 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search startups or investors..."
                className="w-full bg-secondary/50 border-none pl-9 rounded-full focus-visible:ring-1"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold cursor-pointer">
              JD
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
