"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/lib/auth/AuthProvider";
import { useMounted } from "@/lib/hooks/useMounted";

export function TopBar() {
  const mounted = useMounted();
  const { user } = useAuthContext();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (!pathname) return "Dashboard";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.includes("ai-assistant") || segments[segments.length - 1] === "chat") {
      return "AI Assistant";
    }
    const last = segments[segments.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="h-16 bg-slate-950/60 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30 shrink-0">
      <h2 className="text-lg font-bold text-white tracking-wide">{getPageTitle()}</h2>

      {mounted && user ? (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-200">{user.name}</div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{user.role}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="font-extrabold text-slate-200">{user.name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-800/50 animate-pulse" />
      )}
    </header>
  );
}
