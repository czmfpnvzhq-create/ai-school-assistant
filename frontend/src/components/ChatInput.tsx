import React, { useState, useEffect, useRef } from "react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [seconds, setSeconds] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Timer effect to track elapsed seconds while waiting for AI response
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!inputValue.trim() || isLoading) return;
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  // Re-focus the input once loading state returns to false
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  return (
    <form onSubmit={handleSubmit} className="relative w-full z-20">
      {isLoading && (
        <div className="absolute -top-10 left-4 flex items-center gap-2.5 text-xs font-bold text-indigo-300 transition-opacity duration-300 animate-fade-in-up">
          <div className="relative flex items-center justify-center w-5 h-5">
            <svg
              className="absolute animate-spin text-indigo-500 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <span className="tracking-wide">Synthesizing response...</span>
          <span className="bg-indigo-900/50 border border-indigo-500/30 px-2.5 py-1 rounded-md text-[10px] text-indigo-200 font-mono shadow-[0_0_10px_rgba(99,102,241,0.2)]">
            T+{seconds}s
          </span>
        </div>
      )}

      <div className="relative group">
        <div className={`absolute -inset-0.5 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-500 ${isLoading ? 'bg-indigo-500 animate-pulse' : 'bg-gradient-to-r from-indigo-500 to-cyan-500'}`}></div>
        <div className="relative flex items-end gap-3 rounded-2xl p-2.5 glass-input">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Initialize query sequence (e.g. Find top students in Class 10)"
            className="flex-grow bg-transparent border-0 outline-none resize-none max-h-32 min-h-[44px] text-sm text-slate-100 focus:ring-0 placeholder-slate-500 font-medium py-3 px-3 scrollbar-hide"
            disabled={isLoading}
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className={`flex items-center justify-center p-3.5 rounded-xl transition-all duration-300 mb-0.5 ${
              isLoading || !inputValue.trim()
                ? "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 active:scale-[0.97] shadow-[0_0_15px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.8)]"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
      <div className="text-[10px] text-slate-500/80 font-bold uppercase tracking-widest text-center mt-4">
        Enter to execute • Shift+Enter for newline
      </div>
    </form>
  );
}
