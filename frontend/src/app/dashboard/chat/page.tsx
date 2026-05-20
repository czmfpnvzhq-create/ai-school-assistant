"use client";

import React, { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";
import { ExampleQueries } from "@/components/ExampleQueries";
import { Message } from "@/components/MessageBubble";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (content: string) => {
    setError(null);
    setIsLoading(true);

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      const apiMessages = updatedMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "An unexpected API error occurred.");
      }

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: data.reply,
        toolCalled: data.toolCalled,
        toolArgs: data.toolArgs,
        toolResult: data.toolResult,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to communicate with AI School Assistant.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-slate-950/50 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative z-10 backdrop-blur-md">
      {/* Header */}
      <header className="h-14 glass-panel border-b border-white/5 px-6 flex items-center justify-between shrink-0 z-30 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-200 tracking-wide">
            Live Terminal
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"></span>
        </div>

        <div className="flex items-center gap-4">
          {error && (
            <div className="text-xs font-bold text-rose-400 bg-rose-950/50 border border-rose-900/50 px-3 py-1 rounded-full shadow-lg">
              ⚠️ {error}
            </div>
          )}
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={isLoading}
              className="text-xs py-1 px-3 rounded-lg border border-rose-900/50 bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 transition-all font-bold shadow-sm active:scale-[0.98]"
            >
              Clear Session
            </button>
          )}
        </div>
      </header>

      {/* Main Grid: Chat on Left, Suggestions on Right (if empty) */}
      <div className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 flex flex-col relative z-10">
          <ChatWindow messages={messages} isLoading={isLoading} />
          
          <div className="p-4 bg-transparent shrink-0 border-t border-white/5 bg-slate-950/30 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto">
              <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </div>

        {/* Suggestions Panel */}
        {messages.length === 0 && (
          <div className="w-80 border-l border-white/5 bg-slate-900/30 p-6 overflow-y-auto hidden lg:block z-20">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
              Suggested Queries
            </div>
            <ExampleQueries onSelectQuery={handleSendMessage} disabled={isLoading} />
          </div>
        )}
      </div>
    </div>
  );
}
