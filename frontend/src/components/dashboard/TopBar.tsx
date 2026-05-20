"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface User {
  name: string;
  role: string;
}

export function TopBar() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem("edunexus_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const getPageTitle = () => {
    if (!pathname) return "Dashboard";
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1 && segments[0] === "dashboard") return "Dashboard";
    if (segments[segments.length - 1] === "chat") return "AI Assistant";
    
    // Capitalize the last segment
    const last = segments[segments.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="h-20 bg-slate-950/40 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30 shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-white tracking-wide">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-white transition-colors group">
          <span className="text-xl group-hover:animate-swing block origin-top">🔔</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></span>
        </button>

        <div className="h-8 w-px bg-white/10"></div>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-200">{user.name}</div>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{user.role}</div>
            </div>
            <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 to-purple-600/30 group-hover:scale-110 transition-transform duration-500"></div>
              <span className="font-extrabold text-lg text-slate-200 relative z-10 shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-40 h-11 bg-slate-800/50 animate-pulse rounded-full"></div>
        )}
      </div>
    </header>
  );
}
