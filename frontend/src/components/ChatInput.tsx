import React, { useState, useEffect, useRef } from "react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const submit = () => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`flex items-end gap-2 rounded-2xl border bg-slate-900/80 backdrop-blur-md p-2 transition-shadow ${
          isLoading
            ? "border-indigo-500/40 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]"
            : "border-slate-700/60 focus-within:border-indigo-500/50 focus-within:shadow-[0_0_0_1px_rgba(99,102,241,0.25)]"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about attendance, fees, students, or notices…"
          className="flex-1 bg-transparent border-0 outline-none resize-none max-h-28 min-h-[44px] text-sm text-slate-100 placeholder:text-slate-500 py-2.5 px-3"
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          aria-label="Send message"
          className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
            isLoading || !inputValue.trim()
              ? "bg-slate-800 text-slate-600 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-900/40"
          }`}
        >
          {isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          )}
        </button>
      </div>
      <p className="text-center text-[10px] text-slate-600 mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </form>
  );
}
