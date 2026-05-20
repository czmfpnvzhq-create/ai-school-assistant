import React from "react";
import { ToolCallBadge } from "./ToolCallBadge";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalled?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolArgs?: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolResult?: any | null;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} animate-fade-in-up`}>
      <div className={`flex max-w-[85%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar Ring */}
        <div className="shrink-0 pt-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border shadow-lg ${
            isUser 
              ? "bg-slate-800 border-slate-600/50" 
              : "bg-indigo-950/80 border-indigo-500/50"
          }`}>
            {isUser ? "👤" : "🤖"}
          </div>
        </div>

        {/* Message Content Container */}
        <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`p-4 rounded-2xl shadow-xl leading-relaxed text-sm ${
              isUser
                ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm border border-indigo-400/30"
                : "glass-panel text-slate-200 rounded-tl-sm"
            }`}
          >
            <p className="whitespace-pre-wrap break-words font-medium leading-relaxed">
              {message.content}
            </p>
          </div>

          {/* Display Premium Terminal Badge if the AI triggered a database query */}
          {!isUser && message.toolCalled && (
            <div className="mt-1 w-full max-w-[95%]">
              <ToolCallBadge
                toolName={message.toolCalled}
                toolArgs={message.toolArgs || null}
                toolResult={message.toolResult || null}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
