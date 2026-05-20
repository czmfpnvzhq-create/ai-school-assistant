import React, { useState } from "react";

interface ToolCallBadgeProps {
  toolName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolArgs: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolResult: any | null;
}

export function ToolCallBadge({ toolName, toolArgs, toolResult }: ToolCallBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-1 w-full text-xs animate-fade-in-up">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-cyan-400 font-semibold hover:bg-slate-800 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 shadow-sm w-full max-w-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg blur-sm"></div>
        <span className="relative z-10 flex items-center justify-center w-4 h-4 bg-slate-950 rounded-full border border-slate-700">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>
        </span>
        <span className="relative z-10 text-[10px] tracking-widest uppercase">System Protocol:</span>
        <code className="relative z-10 font-mono text-white tracking-wide truncate">{toolName}</code>
        <div className="relative z-10 ml-auto bg-slate-800 rounded p-0.5">
          <svg
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="mt-2 w-full p-4 bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden font-mono text-[10px] shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-indigo-500 opacity-50"></div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-slate-500 font-bold mb-2 uppercase tracking-widest text-[9px]">
                <span className="w-2 h-2 rounded-sm bg-indigo-500/50 block"></span>
                Input Parameters
              </div>
              <pre className="overflow-x-auto text-indigo-300 p-2 bg-black/40 rounded-md border border-white/5">{JSON.stringify(toolArgs, null, 2)}</pre>
            </div>
            
            <div className="border-t border-slate-800 pt-3">
              <div className="flex items-center gap-2 text-slate-500 font-bold mb-2 uppercase tracking-widest text-[9px]">
                <span className="w-2 h-2 rounded-sm bg-cyan-500/50 block"></span>
                Database Response Trace
              </div>
              <pre className="overflow-x-auto text-cyan-300 p-2 bg-black/40 rounded-md border border-white/5 max-h-48 scrollbar-thin scrollbar-thumb-slate-700">{JSON.stringify(toolResult, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
