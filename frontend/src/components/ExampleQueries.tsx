import React from "react";

interface ExampleQueriesProps {
  onSelectQuery: (query: string) => void;
  disabled: boolean;
}

export const EXAMPLES = [
  "How many students are in Class 6?",
  "List absent students today",
  "Add a new student Ahmed in Class 7",
  "Who are the top 5 students in Class 10?",
  "Give me a summary of Class 8"
];

export function ExampleQueries({ onSelectQuery, disabled }: ExampleQueriesProps) {
  return (
    <div className="space-y-3 relative z-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-3 bg-indigo-500 rounded-full block shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
        <h2 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
          Quick Action Modules
        </h2>
      </div>
      <div className="flex flex-col gap-2.5">
        {EXAMPLES.map((query, index) => (
          <button
            key={index}
            onClick={() => onSelectQuery(query)}
            disabled={disabled}
            className={`relative group text-left text-xs p-3.5 rounded-xl border transition-all duration-300 font-semibold leading-relaxed overflow-hidden ${
              disabled
                ? "bg-slate-900/50 text-slate-600 cursor-not-allowed border-slate-800"
                : "bg-slate-800/40 border-slate-700/50 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-white hover:shadow-[0_4px_20px_rgba(99,102,241,0.15)] focus:outline-none active:scale-[0.98]"
            }`}
          >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex items-start gap-2">
              <span className="text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity mt-0.5">›</span>
              {query}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
