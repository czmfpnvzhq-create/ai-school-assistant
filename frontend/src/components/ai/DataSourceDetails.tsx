"use client";

import React, { useState } from "react";

interface DataSourceDetailsProps {
  toolName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolArgs: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolResult: any | null;
}

/** Collapsed technical trace — hidden by default for portfolio-ready UX. */
export function DataSourceDetails({
  toolName,
  toolArgs,
  toolResult,
}: DataSourceDetailsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full text-xs">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
      >
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
        {open ? "Hide" : "Show"} source data
      </button>

      {open && (
        <div className="mt-2 p-3 rounded-lg bg-slate-900/80 border border-white/5 font-mono text-[10px] space-y-2 max-h-48 overflow-y-auto">
          <div>
            <span className="text-slate-500 uppercase tracking-wider">Parameters</span>
            <pre className="text-indigo-300 mt-1">
              {JSON.stringify(toolArgs ?? {}, null, 2)}
            </pre>
          </div>
          <div>
            <span className="text-slate-500 uppercase tracking-wider">Raw result</span>
            <pre className="text-cyan-300/90 mt-1">
              {JSON.stringify(toolResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
