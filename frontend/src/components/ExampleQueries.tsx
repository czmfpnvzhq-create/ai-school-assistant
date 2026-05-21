import React from "react";
import type { AiRole } from "@/lib/ai/tool-permissions";

interface ExampleQueriesProps {
  onSelectQuery: (query: string) => void;
  disabled: boolean;
  role: AiRole;
}

const ADMIN_EXAMPLES = [
  "Show me data for student Ahmed Raza",
  "How many students are absent today?",
  "Show me top 5 students in Class 10",
  "What is the fee collection rate?",
  "List all recent notices",
  "Add a new student Ali in Class 7",
  "Show attendance report for Class 8",
];

const TEACHER_EXAMPLES = [
  "Show me data for student Ahmed Raza",
  "How many students are absent today?",
  "Show me top 5 students in Class 10",
  "List all recent notices",
  "Show attendance report for Class 8",
  "Give me a summary of Class 8",
  "List all students in my class",
];

export function getExamplesForRole(role: AiRole): string[] {
  return role === "ADMIN" ? ADMIN_EXAMPLES : TEACHER_EXAMPLES;
}

/** @deprecated Use AiQuickChips — kept for any legacy imports */
export function ExampleQueries({ onSelectQuery, disabled, role }: ExampleQueriesProps) {
  const examples = getExamplesForRole(role);

  return (
    <div className="space-y-2">
      {examples.map((query, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelectQuery(query)}
          disabled={disabled}
          className="w-full text-left text-sm p-3 rounded-xl border border-slate-700/40 bg-slate-800/30 hover:bg-slate-800 text-slate-300 disabled:opacity-40"
        >
          {query}
        </button>
      ))}
    </div>
  );
}
