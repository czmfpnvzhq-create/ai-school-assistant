"use client";

import React from "react";
import { getExamplesForRole } from "@/components/ExampleQueries";
import type { AiRole } from "@/lib/ai/tool-permissions";

interface AiQuickChipsProps {
  role: AiRole;
  onSelect: (query: string) => void;
  disabled?: boolean;
  variant?: "grid" | "inline";
}

export function AiQuickChips({
  role,
  onSelect,
  disabled,
  variant = "grid",
}: AiQuickChipsProps) {
  const examples = getExamplesForRole(role).slice(0, variant === "inline" ? 4 : 6);

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
        {examples.map((query) => (
          <button
            key={query}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(query)}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-950/40 hover:text-white transition-all disabled:opacity-40"
          >
            {query}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {examples.map((query) => (
        <button
          key={query}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(query)}
          className="group text-left text-sm p-3.5 rounded-xl border border-slate-700/40 bg-slate-800/30 hover:border-indigo-500/40 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all disabled:opacity-40"
        >
          <span className="text-indigo-400 mr-2 opacity-70 group-hover:opacity-100">→</span>
          {query}
        </button>
      ))}
    </div>
  );
}
