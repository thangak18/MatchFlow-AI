"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/organizer/dashboard", icon: LayoutDashboard },
  { name: "Startups", href: "/startup/profile", icon: Briefcase },
  { name: "Matches", href: "/matches", icon: Users },
  { name: "Schedule", href: "/organizer/schedule", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

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

      <div className="pt-4 mt-auto border-t border-border">
        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors">
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
