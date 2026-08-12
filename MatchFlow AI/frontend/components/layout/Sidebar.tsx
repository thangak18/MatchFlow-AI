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
      await fetch("http://localhost:8000/api/auth/logout", {
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
    ];
  } else if (user?.role === "investor") {
    navItems = [
      { name: "My Dashboard", href: "/investor/dashboard", icon: LayoutDashboard },
    ];
  }

  // Do not render sidebar on login/signup pages if we want, or render a minimal one
  if (pathname === "/signin" || pathname === "/signup" || pathname === "/") return null;

  return (
    <aside className="w-64 flex flex-col border-r border-border bg-sidebar px-4 py-6 h-screen sticky top-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground">
          MatchFlow AI
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")}
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
