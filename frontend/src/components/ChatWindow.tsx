import React, { useEffect, useRef } from "react";
import { MessageBubble, Message } from "./MessageBubble";

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatWindow({ messages, isLoading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the viewport whenever a new message is logged or loading triggers
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-grow overflow-y-auto p-6 space-y-6">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
          <div className="p-8 glass-panel rounded-3xl max-w-md animate-fade-in-up relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-[50px] pointer-events-none group-hover:bg-indigo-500/30 transition-all duration-700"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
                <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">🏫</span>
              </div>
              <h3 className="text-xl font-extrabold text-white mb-3">
                Welcome to <span className="gradient-text">EduNexus</span>
              </h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                Query Pakistani student records, attendance reports, academic grades, or manage class rosters in real-time.
              </p>
              <div className="inline-flex items-center gap-2 bg-indigo-950/40 border border-indigo-500/30 px-4 py-2 rounded-xl">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse-glow"></span>
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
                  Secure Neon Link Active
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      )}

      {/* Render AI Processing / Thinking Indicator */}
      {isLoading && (
        <div className="max-w-4xl mx-auto w-full flex items-start mt-4 mb-4 animate-fade-in-up">
          <div className="glass-panel text-slate-300 p-4 rounded-2xl rounded-bl-sm flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <span className="text-lg">🤖</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Accessing secure database
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
