"use client";

import { useEffect, useState } from "react";

const USER_MESSAGE =
  "Who are the top 3 students in Class 6 and are they present today?";

const AI_LINES = [
  "Calling get_top_students…",
  "Calling get_attendance_report…",
  "Ahmed Raza (98%) ✓ Present",
  "Sara Khan (95%) ✓ Present",
  "Hassan Ali (92%) ✓ Present",
];

type Phase = "idle" | "user" | "thinking" | "typing" | "done";

export function MockChatCard() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [currentLine, setCurrentLine] = useState("");

  useEffect(() => {
    const t0 = setTimeout(() => setPhase("user"), 400);
    const t1 = setTimeout(() => setPhase("thinking"), 1200);
    const t2 = setTimeout(() => {
      setPhase("typing");
      setLineIndex(0);
      setCharIndex(0);
      setCurrentLine("");
      setVisibleLines([]);
    }, 2200);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;

    const line = AI_LINES[lineIndex];
    if (!line) {
      setPhase("done");
      return;
    }

    if (charIndex < line.length) {
      const timer = setTimeout(() => {
        setCurrentLine(line.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, line.startsWith("Calling") ? 28 : 22);
      return () => clearTimeout(timer);
    }

    const pause = line.startsWith("Calling") ? 500 : 350;
    const timer = setTimeout(() => {
      setVisibleLines((prev) => [...prev, line]);
      setCurrentLine("");
      setCharIndex(0);
      setLineIndex((i) => i + 1);
    }, pause);
    return () => clearTimeout(timer);
  }, [phase, lineIndex, charIndex]);

  return (
    <div className="landing-float landing-glow-blue relative w-full max-w-md rounded-2xl landing-glass p-1 sm:max-w-lg">
      <div className="rounded-[14px] bg-slate-950/80 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">
            AI
          </span>
          <div>
            <p className="font-syne text-sm font-semibold text-white">EduNexus AI</p>
            <p className="font-dm-sans text-xs text-slate-500">Live · Agentic tools</p>
          </div>
          <span className="ml-auto flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        </div>

        <div className="space-y-3 font-dm-sans text-sm">
          {(phase === "user" ||
            phase === "thinking" ||
            phase === "typing" ||
            phase === "done") && (
            <div className="flex justify-end">
              <div className="max-w-[90%] rounded-2xl rounded-tr-sm bg-blue-600/90 px-3.5 py-2.5 text-white shadow-lg shadow-blue-900/30">
                {USER_MESSAGE}
              </div>
            </div>
          )}

          {(phase === "thinking" || phase === "typing" || phase === "done") && (
            <div className="flex gap-2">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
                <SparkleSmall />
              </span>
              <div className="min-h-[120px] flex-1 rounded-2xl rounded-tl-sm border border-slate-800/80 bg-slate-900/60 px-3.5 py-3 text-slate-300">
                {phase === "thinking" && (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:300ms]" />
                    </span>
                    <span className="text-xs">Reasoning…</span>
                  </div>
                )}

                {(phase === "typing" || phase === "done") && (
                  <div className="space-y-2">
                    {visibleLines.map((line) => (
                      <p
                        key={line}
                        className={
                          line.startsWith("Calling")
                            ? "font-mono text-xs text-cyan-400/90"
                            : "text-slate-200"
                        }
                      >
                        {line.startsWith("Calling") ? (
                          <>
                            <span className="text-slate-600">› </span>
                            {line}
                          </>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                    {phase === "typing" && currentLine && (
                      <p
                        className={
                          currentLine.startsWith("Calling") || AI_LINES[lineIndex]?.startsWith("Calling")
                            ? "font-mono text-xs text-cyan-400/90"
                            : "text-slate-200"
                        }
                      >
                        {(AI_LINES[lineIndex]?.startsWith("Calling") ?? false) && (
                          <span className="text-slate-600">› </span>
                        )}
                        {currentLine}
                        <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-blink-cursor bg-blue-400 align-middle" />
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SparkleSmall() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.2 4.2L17.4 7.5l-4.2 1.2L12 13l-1.2-4.3L6.6 7.5l4.2-1.3L12 2z" />
    </svg>
  );
}
