import React, { useEffect, useRef } from "react";
import { MessageBubble, Message } from "./MessageBubble";
import { AiQuickChips } from "@/components/ai/AiQuickChips";
import type { AiRole } from "@/lib/ai/tool-permissions";

export type AgentStatusPhase = "thinking" | "tool" | null;

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  streamingMessageId?: string | null;
  agentStatus?: AgentStatusPhase;
  agentStatusTool?: string;
  userName?: string;
  role: AiRole;
  onSelectQuery?: (query: string) => void;
}

export function ChatWindow({
  messages,
  isLoading,
  streamingMessageId,
  agentStatus,
  agentStatusTool,
  userName,
  role,
  onSelectQuery,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, streamingMessageId, agentStatus]);

  const showThinking = isLoading && !streamingMessageId;
  const thinkingTitle =
    agentStatus === "tool" && agentStatusTool
      ? `Running ${agentStatusTool}…`
      : "Thinking…";
  const thinkingSubtitle =
    agentStatus === "tool"
      ? "Fetching live data from the database"
      : "Planning tools and checking your question";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto ai-chat-mesh">
      <div className="p-4 sm:p-6 min-h-full flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-cyan-600/20 border border-indigo-500/30 flex items-center justify-center mb-5 shadow-xl">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Ask anything about your school
            </h3>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
              Attendance, fees, grades, notices, and class lists — answers come from
              your live database, not guesses.
            </p>
            {onSelectQuery && (
              <AiQuickChips
                role={role}
                onSelect={onSelectQuery}
                disabled={isLoading}
                variant="inline"
              />
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full space-y-8 pb-2">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                userName={userName}
                isStreaming={msg.id === streamingMessageId}
              />
            ))}
          </div>
        )}

        {showThinking && (
          <div className="max-w-3xl mx-auto w-full mt-6 animate-fade-in-up">
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: "120ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: "240ms" }}
                  />
                </span>
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-slate-900/50 px-4 py-3">
                <p className="text-sm text-slate-300">{thinkingTitle}</p>
                <p className="text-[10px] text-slate-500 mt-1">{thinkingSubtitle}</p>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} className="h-2 shrink-0" />
      </div>
    </div>
  );
}
