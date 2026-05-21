"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] font-sans text-slate-100 selection:bg-blue-500/30">
        <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/8 rounded-full pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/8 rounded-full pointer-events-none" />

        <Sidebar />
        <div className="flex flex-col flex-1 relative z-10 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            <div className="max-w-7xl mx-auto h-full">{children}</div>
          </main>
        </div>
    </div>
  );
}
