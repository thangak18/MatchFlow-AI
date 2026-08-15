"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  LogOut,
  Sparkles,
  CalendarDays,
  CalendarClock,
  LineChart,
} from "lucide-react";
import { useAuth } from "@/lib/useAuth";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth(false);

  const handleLogout = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
      router.push("/signin");
    } catch (err) {
      console.error(err);
    }
  };

  let navItems: any[] = [];
  if (user?.role === "organizer") {
    navItems = [
      { name: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
      { name: "Matches", href: "/matches", icon: Users },
      { name: "Schedule", href: "/organizer/schedule", icon: CalendarDays },
      { name: "Availability", href: "/organizer/availability", icon: CalendarClock },
    ];
  } else if (user?.role === "startup") {
    navItems = [
      { name: "My Profile", href: "/startup/profile", icon: Briefcase },
      { name: "Upload Pitch Deck", href: "/startup/upload", icon: Sparkles },
      { name: "Matches", href: "/matches", icon: Users },
      { name: "Schedule", href: "/startup/schedule", icon: CalendarDays },
    ];
  } else if (user?.role === "investor") {
    navItems = [
      { name: "My Dashboard", href: "/investor/dashboard", icon: LayoutDashboard },
      { name: "My Profile", href: "/investor/profile", icon: Briefcase },
      { name: "Schedule", href: "/investor/schedule", icon: CalendarDays },
    ];
  }

  // Do not render sidebar on login/signup pages if we want, or render a minimal one
  if (pathname === "/signin" || pathname === "/signup" || pathname === "/") return null;

  return (
    <aside className="w-64 flex flex-col border-r border-white/60 bg-white/40 backdrop-blur-xl px-4 py-6 h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-1.5 rounded-lg shadow-inner">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="font-black text-xl tracking-tighter text-[#1C1917]">
          MatchFlow AI
        </span>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-white/80 text-amber-600 shadow-sm border border-white/80"
                  : "text-slate-500 hover:bg-white/50 hover:text-slate-800"
              )}
            >
              <item.icon
                className={cn("w-5 h-5", isActive ? "text-amber-500" : "text-slate-400")}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="pt-4 mt-auto border-t border-border">
          <div className="px-3 mb-2">
            <p className="text-sm font-semibold text-foreground truncate">{user.username}</p>
            <p className="text-xs text-muted-foreground uppercase">{user.role}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      )}
    </aside>
  );
}
